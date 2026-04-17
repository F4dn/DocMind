from typing import List, Generator, Tuple
import json

from sentence_transformers import CrossEncoder

from app.core.vectorstore import get_or_create_collection
from app.core.embeddings.factory import get_embedding_model
from app.core.llm.factory import get_llm


_reranker = None


def get_reranker() -> CrossEncoder:
    global _reranker
    if _reranker is None:
        _reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
    return _reranker


SYSTEM_PROMPT = """You are a precise document assistant. Answer questions ONLY using 
the provided context chunks. 

Rules:
- Cite sources using [chunk_X] notation inline
- If the answer is not in the context, say "I could not find this in the document"
- Be concise and factual
- Never make up information"""


def _generate_query_variants(question: str, llm) -> List[str]:
    """Generate 3 rephrasings to improve retrieval coverage."""
    prompt = f"""Generate 3 different ways to ask this question for document search.
Return ONLY a JSON array of 3 strings, nothing else.

Question: {question}

Example output: ["How did revenue change?", "What was the financial growth?", "Revenue increase percentage?"]"""

    try:
        raw = llm.generate(prompt)
        # strip any markdown code fences if model adds them
        raw = raw.strip().strip("```json").strip("```").strip()
        variants = json.loads(raw)
        if isinstance(variants, list):
            return [question] + variants[:3]
    except Exception:
        pass

    return [question]  # fallback to original if parsing fails


def _retrieve_chunks(
    queries: str, collection, embedding_model, document_id: str, top_k: int = 20
) -> List[dict]:
    """different queries can give same chunks"""
    seen_ids = set()
    all_chunks = []

    for query in queries:
        query_embedding = embedding_model.embed_query(query)
        try:
            filtered_count = collection.count()  # rough upper bound
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=min(top_k, max(1, filtered_count)),
                where={"document_id": {"$eq": document_id}},
                include=["documents", "metadatas", "distances"],
            )
        except Exception:
            # ChromaDB raises if 0 results match the filter
            continue

        if not results["ids"][0]:
            continue

        for i, chunk_id in enumerate(results["ids"][0]):
            if chunk_id not in seen_ids:
                seen_ids.add(chunk_id)
                all_chunks.append(
                    {
                        "id": chunk_id,
                        "content": results["documents"][0][i],
                        "metadata": results["metadatas"][0][i],
                        "distance": results["distances"][0][i],
                    }
                )

    return all_chunks


def _rerank_chunks(
    question: str,
    chunks: List[dict],
    top_n: int = 5,
) -> List[dict]:
    """Use cross-encoder to rerank retrieved chunks by actual relevance."""
    if not chunks:
        return []

    reranker = get_reranker()
    pairs = [(question, chunk["content"]) for chunk in chunks]
    scores = reranker.predict(pairs)

    for chunk, score in zip(chunks, scores):
        chunk["rerank_score"] = float(score)

    reranked = sorted(chunks, key=lambda x: x["rerank_score"], reverse=True)
    return reranked[:top_n]


def _build_rag_prompt(question: str, chunks: List[dict]) -> str:
    """bulid final prompt with numbered context chunk"""

    context_parts = []

    for i, chunk in enumerate(chunks):
        meta = chunk["metadata"]
        context_parts.append(
            f"[chunk_{i}] (Source: {meta.get('source', 'unknown')}, "
            f"Page: {meta.get('page', 'N/A')})\n{chunk['content']}"
        )

    context = "\n\n---\n\n".join(context_parts)

    return f"""Context chunks from the document:

{context}

---

Question: {question}

Answer using the context above. Cite chunks inline as [chunk_0], [chunk_1], etc."""


def stream_rag_response(
    question: str, document_id: str, user_id: str
) -> Tuple[Generator[str, None, None], List[dict]]:

    embedding_model = get_embedding_model()
    llm = get_llm()

    # 1. Get user's ChromaDB collection
    collection = get_or_create_collection(user_id)

    # Check document has been ingested
    if collection.count() == 0:

        def empty_stream():
            yield "This document has not been processed yet. Please wait for ingestion to complete."

        return empty_stream(), []

    # 2. Multi-query expansion
    query_variants = _generate_query_variants(question, llm)

    # 3. Retrieve from ChromaDB (filter by document_id for isolation)
    doc_chunks = _retrieve_chunks(
        queries=query_variants,
        collection=collection,
        embedding_model=embedding_model,
        document_id=document_id,
        top_k=20,
    )

    if not doc_chunks:

        def no_result_stream():
            yield "I could not find relevant content in this document to answer your question."

        return no_result_stream(), []

    # 4. Rerank top-5
    top_chunks = _rerank_chunks(question, doc_chunks, top_n=5)

    # 5. Build prompt and stream
    prompt = _build_rag_prompt(question, top_chunks)

    # Format sources for DB persistence
    sources = [
        {
            "chunk_index": chunk["metadata"].get("chunk_index", i),
            "page": chunk["metadata"].get("page", "N/A"),
            "source": chunk["metadata"].get("source", "unknown"),
            "content": chunk["content"][:200],  # preview only
            "score": round(chunk.get("rerank_score", 0.0), 4),
        }
        for i, chunk in enumerate(top_chunks)
    ]

    stream = llm.stream(prompt, system=SYSTEM_PROMPT)
    return stream, sources
