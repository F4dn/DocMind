from langchain_google_genai import GoogleGenerativeAIEmbeddings
from app.core.embeddings.base import BaseEmbedding


class GeminiEmbedding(BaseEmbedding):
    def __init__(self, api_key: str):
        self.model = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=api_key,
        )

    def embed(self, texts):
        return self.model.embed_documents(texts)
