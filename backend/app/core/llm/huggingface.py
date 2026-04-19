import json
import requests
from typing import Generator
from app.core.llm.base import BaseLLM


class HuggingFaceLLM(BaseLLM):
    def __init__(
        self,
        api_key: str,
        model: str = "Qwen/Qwen2.5-7B-Instruct",
    ):
        self.api_key = api_key
        self.model = model
        self.api_url = "https://router.huggingface.co/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

    def _build_messages(self, prompt: str, system: str = "") -> list:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        return messages

    def generate(self, prompt: str, system: str = "") -> str:
        payload = {
            "model": self.model,
            "messages": self._build_messages(prompt, system),
            "max_tokens": 1024,
            "temperature": 0.2,
            "stream": False,
        }

        response = requests.post(
            self.api_url,  # ✅ single URL for both
            headers=self.headers,
            json=payload,
            timeout=60,
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"].strip()

    def stream(self, prompt: str, system: str = "") -> Generator[str, None, None]:
        payload = {
            "model": self.model,
            "messages": self._build_messages(prompt, system),
            "max_tokens": 1024,
            "temperature": 0.2,
            "stream": True,
        }

        response = requests.post(
            self.api_url,
            headers=self.headers,
            json=payload,
            stream=True,
            timeout=60,
        )
        response.raise_for_status()

        for line in response.iter_lines():
            if not line:
                continue

            line = line.decode("utf-8")

            if line.startswith("data: "):
                line = line[len("data: ") :]

            if line.strip() == "[DONE]":
                break

            try:
                chunk = json.loads(line)
                token = chunk["choices"][0]["delta"].get("content", "")
                if token:
                    yield token
            except (json.JSONDecodeError, KeyError):
                continue
