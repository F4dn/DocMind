from app.config import settings
from app.core.embeddings.openai import OpenAIEmbedding
from app.core.embeddings.gemini import GeminiEmbedding
from app.core.embeddings.huggingface import HuggingFaceEmbedding


def get_embedding_model():
    provider = settings.embedding_provider.lower()

    if provider == "openai":
        return OpenAIEmbedding(settings.openai_api_key)

    elif provider == "gemini":
        return GeminiEmbedding(settings.gemini_api_key)

    elif provider == "huggingface":
        return HuggingFaceEmbedding()

    else:
        raise ValueError(f"Unsupported embedding provider: {provider}")
