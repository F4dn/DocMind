from typing import List
import google.generativeai as genai
from app.core.embeddings.base import BaseEmbedding


class GeminiEmbedding(BaseEmbedding):
    def __init__(self, api_key: str, model: str = "models/gemini-embedding-001"):
        genai.configure(api_key=api_key)
        self.model = model

    def embed_document(self, texts: List[str]) -> List[List[float]]:
        embeddings = []
        for text in texts:
            result = genai.embed_content(
                model=self.model, content=text, task_type="retrieval_document"
            )
            embeddings.append(result["embedding"])
        return embeddings

    def embed_query(self, text: str) -> List[float]:
        result = genai.embed_content(
            model=self.model, content=text, task_type="retrieval_query"
        )
        return result["embedding"]
