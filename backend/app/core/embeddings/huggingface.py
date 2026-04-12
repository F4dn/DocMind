from langchain_community.embeddings import HuggingFaceEmbeddings
from app.core.embeddings.base import BaseEmbedding


class HuggingFaceEmbedding(BaseEmbedding):
    def __init__(self):
        self.model = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

    def embed(self, texts):
        return self.model.embed_documents(texts)
