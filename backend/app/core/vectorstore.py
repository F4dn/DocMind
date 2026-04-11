from webbrowser import get

import chromadb
import chromadb.config as Settings
from app.config import settings


def get_chroma_client() -> chromadb.HttpClient:
    return chromadb.HttpClient(
        Settings.Settings(
            host=settings.chroma_host,
            port=settings.chroma_port,
            settings=Settings(anonymized_telemetry=False),
        )
    )


# Each user get it's own seperate collection in chroma
def get_or_create_collection(user_id: str):
    client = get_chroma_client()
    collection_name = f"user_{user_id.replace('-', '_')}"
    return client.get_or_create_collection(
        name=collection_name, metadata={"hnsw:space": "cosine"}
    )


# to remove all the chunks of a specific document, we can delete the vectors with the corresponding document_id
def delete_document_vectors(user_id: str, document_id: str):
    client = get_chroma_client()
    collection_name = f"user_{user_id.replace('-', '_')}"
    try:
        collection = client.get_collection(name=collection_name)
        collection.delete(where={"document_id": document_id})
    except Exception:
        pass
