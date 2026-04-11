from langchain_openai import OpenAIEmbeddings
from app.core.embeddings.base import BaseEmbeddings


class OpenAIEmbeddings(BaseEmbeddings):
    def __init__(self, api_key: str):
        self.model = OpenAIEmbeddings(model="text-embedding-3-small", api_key=api_key)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return self.model.embed_documents(texts)
