import asyncio
import json
import os
import httpx
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall,
)
from ragas.llms import LangchainLLMWrapper
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings

BASE_URL = "http://localhost:8000"
TOKEN = os.environ["TOKEN"]
DOCUMENT_ID = os.environ["DOCUMENT_ID"]
GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
GROUND_TRUTH_FILE = "eval/ground_truth.json"


async def fetch_rag_answer(client: httpx.AsyncClient, question: str) -> dict:
    res = await client.post(
        f"{BASE_URL}/chat/query",
        headers={"Authorization": f"Bearer {TOKEN}"},
        json={"question": question, "document_id": DOCUMENT_ID},
        timeout=60,
    )
    res.raise_for_status()
    return res.json()


async def build_dataset() -> Dataset:
    with open(GROUND_TRUTH_FILE) as f:
        ground_truths = json.load(f)

    questions, answers, contexts, truths = [], [], [], []

    async with httpx.AsyncClient() as client:
        for item in ground_truths:
            print(f"  Fetching: {item['question'][:60]}...")
            response = await fetch_rag_answer(client, item["question"])

            questions.append(item["question"])
            answers.append(response["answer"])
            contexts.append(response["sources"])
            truths.append(item["ground_truth"])

    return Dataset.from_dict(
        {
            "question": questions,
            "answer": answers,
            "contexts": contexts,
            "ground_truth": truths,
        }
    )


async def main():
    print("=== DocMind RAGAS Evaluation ===")
    print(f"Document: {DOCUMENT_ID}")
    print(f"Questions: {sum(1 for _ in open(GROUND_TRUTH_FILE))//6 + 1}\n")

    print("Step 1 — Fetching RAG answers...")
    dataset = await build_dataset()

    print("\nStep 2 — Running RAGAS evaluation...")
    llm = LangchainLLMWrapper(
        ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=GEMINI_API_KEY,
        )
    )
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=GEMINI_API_KEY,
    )

    result = evaluate(
        dataset=dataset,
        metrics=[
            faithfulness,
            answer_relevancy,
            context_precision,
            context_recall,
        ],
        llm=llm,
        embeddings=embeddings,
    )

    scores = {
        "faithfulness": round(result["faithfulness"], 3),
        "answer_relevancy": round(result["answer_relevancy"], 3),
        "context_precision": round(result["context_precision"], 3),
        "context_recall": round(result["context_recall"], 3),
        "overall": round(
            sum(
                [
                    result["faithfulness"],
                    result["answer_relevancy"],
                    result["context_precision"],
                    result["context_recall"],
                ]
            )
            / 4,
            3,
        ),
    }

    print("\n=== Results ===")
    for metric, score in scores.items():
        bar = "█" * int(score * 20)
        print(f"{metric:<22} {score:.3f}  {bar}")

    os.makedirs("eval/results", exist_ok=True)
    with open("eval/results/scores.json", "w") as f:
        json.dump(scores, f, indent=2)

    print("\nSaved to eval/results/scores.json")


if __name__ == "__main__":
    asyncio.run(main())
