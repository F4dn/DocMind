from app.config import settings
from app.core.llm.openai import OpenAILLM
from app.core.llm.gemini import GeminiLLM
from app.core.llm.huggingface import HuggingFaceLLM


def get_llm():
    provider = settings.llm_provider.lower()

    if provider == "openai":
        return OpenAILLM(settings.openai_api_key)

    elif provider == "gemini":
        return GeminiLLM(settings.gemini_api_key)

    elif provider == "huggingface":
        return HuggingFaceLLM()

    else:
        raise ValueError(f"Unsupported LLM provider: {provider}")
