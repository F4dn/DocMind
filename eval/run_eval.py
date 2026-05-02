"""
DocMind RAG Evaluation Pipeline
================================
Runs inside the backend Docker container.

Important: RAGAS judge always uses Gemini (settings.gemini_api_key)
because HuggingFace's AsyncInferenceClient is incompatible with RAGAS.
Your app can still use HuggingFace to generate answers — that's separate.

Usage:
  docker compose exec backend python eval/run_eval.py \
    --email    test@example.com \
    --password test1234 \
    --doc-id   YOUR_DOCUMENT_UUID
"""

import argparse
import json
import sys
import time
from pathlib import Path
from datetime import datetime

import httpx

sys.path.insert(0, "/app")
from app.config import settings


# ─────────────────────────────────────────────────────────────
# 1. Args
# ─────────────────────────────────────────────────────────────
def parse_args():
    p = argparse.ArgumentParser(description="DocMind RAGAS Evaluation")
    p.add_argument("--api-url",  default="http://localhost:8000")
    p.add_argument("--email",    required=True)
    p.add_argument("--password", required=True)
    p.add_argument("--doc-id",   required=True)
    p.add_argument("--dataset",  default="eval/golden_dataset.json")
    p.add_argument("--output",   default="eval/results")
    p.add_argument(
        "--delay",
        type=float,
        default=10.0,
        help="Seconds between questions. 10s recommended for free-tier LLMs.",
    )
    p.add_argument("--retries", type=int, default=3)
    return p.parse_args()


# ─────────────────────────────────────────────────────────────
# 2. RAGAS judge — always Gemini
#    HuggingFace's AsyncInferenceClient.post() was removed in
#    newer versions and breaks RAGAS internally. Gemini works.
# ─────────────────────────────────────────────────────────────
def get_ragas_judge():
    if not settings.gemini_api_key:
        print("✗ RAGAS judge requires GEMINI_API_KEY in your .env")
        print("  Your app can still use HuggingFace for generation —")
        print("  but RAGAS needs a separate judge LLM to score answers.")
        sys.exit(1)

    print("  RAGAS judge LLM   : gemini-1.5-flash")
    print("  RAGAS embeddings  : text-embedding-004")
    print(f"  App LLM provider  : {settings.llm_provider} (used for answer generation)")
    print(f"  App emb provider  : {settings.embedding_provider}\n")

    from langchain_google_genai import (
        ChatGoogleGenerativeAI,
        GoogleGenerativeAIEmbeddings,
    )
    from ragas.llms import LangchainLLMWrapper
    from ragas.embeddings import LangchainEmbeddingsWrapper

    judge_llm = LangchainLLMWrapper(
        ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=settings.gemini_api_key,
            temperature=0,
        )
    )
    judge_embeddings = LangchainEmbeddingsWrapper(
        GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=settings.gemini_api_key,
        )
    )
    return judge_llm, judge_embeddings


# ─────────────────────────────────────────────────────────────
# 3. Safe score extraction
#    Newer RAGAS versions return per-row lists, not a single
#    float. This handles both cases.
# ─────────────────────────────────────────────────────────────
def safe_score(scores: dict, key: str) -> float:
    val = scores[key]
    if isinstance(val, list):
        # Filter out None values from failed rows
        valid = [v for v in val if v is not None]
        return sum(valid) / len(valid) if valid else 0.0
    return float(val) if val is not None else 0.0


# ─────────────────────────────────────────────────────────────
# 4. API helpers
# ─────────────────────────────────────────────────────────────
def login(api_url: str, email: str, password: str) -> str:
    resp = httpx.post(
        f"{api_url}/auth/login",
        json={"email": email, "password": password},
        timeout=30,
    )
    resp.raise_for_status()
    token = resp.json()["access_token"]
    print(f"✓ Logged in as {email}\n")
    return token


def query_document_once(
    api_url: str,
    token: str,
    document_id: str,
    question: str,
) -> dict:
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type":  "application/json",
        "Accept":        "text/event-stream",
    }
    payload = {
        "document_id": document_id,
        "question":    question,
        "session_id":  None,
    }

    answer_tokens = []
    contexts      = []

    with httpx.stream(
        "POST",
        f"{api_url}/chat/query",
        headers=headers,
        json=payload,
        timeout=httpx.Timeout(
            connect=30.0,
            read=240.0,   # 4 min — HuggingFace inference is slow
            write=30.0,
            pool=30.0,
        ),
    ) as resp:
        resp.raise_for_status()
        buffer = ""

        for raw in resp.iter_text():
            buffer += raw
            lines   = buffer.split("\n\n")
            buffer  = lines.pop()

            for line in lines:
                if not line.startswith("data: "):
                    continue
                try:
                    data = json.loads(line[6:])
                    if data["type"] == "token":
                        answer_tokens.append(data["content"])
                    elif data["type"] == "sources":
                        contexts = [s["content"] for s in data["sources"]]
                    elif data["type"] == "done":
                        break
                except (json.JSONDecodeError, KeyError):
                    pass

    answer = "".join(answer_tokens)
    if not answer.strip():
        raise ValueError("Empty answer — stream may have closed early")

    return {"answer": answer, "contexts": contexts}


def query_document(
    api_url: str,
    token: str,
    document_id: str,
    question: str,
    retries: int = 3,
    delay: float = 10.0,
) -> dict:
    last_error = None
    for attempt in range(1, retries + 1):
        try:
            return query_document_once(api_url, token, document_id, question)
        except (httpx.RemoteProtocolError, httpx.ReadTimeout, ValueError) as e:
            last_error = e
            wait = delay * attempt
            print(f"         ⚠ Attempt {attempt}/{retries}: {type(e).__name__}")
            if attempt < retries:
                print(f"         ↻ Retrying in {wait:.0f}s...")
                time.sleep(wait)
        except Exception as e:
            raise e
    raise last_error


# ─────────────────────────────────────────────────────────────
# 5. Main
# ─────────────────────────────────────────────────────────────
def run_evaluation(args):
    dataset_path = Path(args.dataset)
    if not dataset_path.exists():
        print(f"✗ Dataset not found: {dataset_path}")
        sys.exit(1)

    with open(dataset_path) as f:
        golden = json.load(f)

    print("=" * 58)
    print("  DocMind RAGAS Evaluation — Attention Is All You Need")
    print(f"  Questions : {len(golden)}")
    print(f"  Document  : {args.doc_id}")
    print(f"  API       : {args.api_url}")
    print(f"  Delay     : {args.delay}s between questions")
    print("=" * 58 + "\n")

    token = login(args.api_url, args.email, args.password)

    questions     = []
    answers       = []
    contexts_list = []
    ground_truths = []
    per_question  = []
    failed        = []

    for i, item in enumerate(golden, 1):
        question     = item["question"]
        ground_truth = item["ground_truth"]

        print(f"[{i:02d}/{len(golden)}] {question[:65]}...")

        try:
            result   = query_document(
                api_url=args.api_url,
                token=token,
                document_id=args.doc_id,
                question=question,
                retries=args.retries,
                delay=args.delay,
            )
            answer   = result["answer"]
            contexts = result["contexts"]

            questions.append(question)
            answers.append(answer)
            contexts_list.append(contexts)
            ground_truths.append(ground_truth)

            per_question.append({
                "question":     question,
                "ground_truth": ground_truth,
                "answer":       answer,
                "contexts":     contexts,
                "num_chunks":   len(contexts),
                "status":       "ok",
            })

            print(f"         answer  : {answer[:80]}...")
            print(f"         chunks  : {len(contexts)} retrieved")

        except Exception as e:
            print(f"         ✗ Failed: {e}")
            failed.append(question)
            questions.append(question)
            answers.append("")
            contexts_list.append([])
            ground_truths.append(ground_truth)
            per_question.append({
                "question":     question,
                "ground_truth": ground_truth,
                "answer":       "",
                "contexts":     [],
                "num_chunks":   0,
                "status":       f"error: {e}",
            })

        if i < len(golden):
            print(f"         ⏳ Waiting {args.delay:.0f}s...\n")
            time.sleep(args.delay)

    print(f"\n✓ Collected {len(golden) - len(failed)}/{len(golden)} answers")
    if failed:
        print(f"✗ {len(failed)} failed questions")
    print()

    # ── RAGAS scoring ────────────────────────────────────────
    print("=" * 58)
    print("  Running RAGAS scoring (judge: Gemini)...")
    print("=" * 58 + "\n")

    from ragas.metrics.collections import (
        faithfulness,
        answer_relevancy,
        context_recall,
    )
    from ragas import evaluate
    from datasets import Dataset

    ragas_dataset = Dataset.from_dict({
        "question":     questions,
        "answer":       answers,
        "contexts":     contexts_list,
        "ground_truth": ground_truths,
    })

    judge_llm, judge_embeddings = get_ragas_judge()

    scores = evaluate(
        dataset=ragas_dataset,
        metrics=[faithfulness, answer_relevancy, context_recall],
        llm=judge_llm,
        embeddings=judge_embeddings,
    )

    # ── safe_score handles both float and list return types ──
    f_score  = safe_score(scores, "faithfulness")
    ar_score = safe_score(scores, "answer_relevancy")
    cr_score = safe_score(scores, "context_recall")
    overall  = (f_score + ar_score + cr_score) / 3

    print("\n" + "=" * 58)
    print("  RESULTS")
    print("=" * 58)
    print(f"  Faithfulness      : {f_score:.4f}   ({f_score*100:.1f}%)")
    print(f"  Answer Relevancy  : {ar_score:.4f}   ({ar_score*100:.1f}%)")
    print(f"  Context Recall    : {cr_score:.4f}   ({cr_score*100:.1f}%)")
    print(f"  {'─'*44}")
    print(f"  Overall Average   : {overall:.4f}   ({overall*100:.1f}%)")
    print("=" * 58)

    if overall >= 0.85:
        print("  Grade : Excellent ✓")
    elif overall >= 0.70:
        print("  Grade : Good ✓")
    elif overall >= 0.55:
        print("  Grade : Acceptable")
    else:
        print("  Grade : Needs work")
    print()

    # ── Save ─────────────────────────────────────────────────
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp  = datetime.now().strftime("%Y%m%d_%H%M%S")

    output_data = {
        "timestamp":      timestamp,
        "document_id":    args.doc_id,
        "num_questions":  len(golden),
        "num_successful": len(golden) - len(failed),
        "num_failed":     len(failed),
        "providers": {
            "app_llm":       settings.llm_provider,
            "app_embedding": settings.embedding_provider,
            "ragas_judge":   "gemini-1.5-flash",
        },
        "scores": {
            "faithfulness":     round(f_score, 4),
            "answer_relevancy": round(ar_score, 4),
            "context_recall":   round(cr_score, 4),
            "overall_average":  round(overall, 4),
        },
        "per_question": per_question,
    }

    for path in [
        output_dir / f"eval_{timestamp}.json",
        output_dir / "latest.json",
    ]:
        with open(path, "w") as f:
            json.dump(output_data, f, indent=2)

    print(f"✓ Results → {output_dir}/eval_{timestamp}.json")
    print(f"✓ Latest  → {output_dir}/latest.json\n")


if __name__ == "__main__":
    args = parse_args()
    run_evaluation(args)