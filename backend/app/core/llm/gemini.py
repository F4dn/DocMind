from importlib.resources import contents
from typing import Generator

import google.generativeai as genai
from app.core.llm.base import BaseLLM


class GeminiLLM(BaseLLM):
    def __init__(self, api_key: str, model: str = "gemini-1.5-flash"):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            model_name=model, temperature=0.2, max_output_tokens=1024
        )

    def generate(self, prompt: str, system: str = "") -> str:
        contents = []
        if system:
            contents.append({"role": "system", "parts": [system]})
            contents.append({"role": "user", "parts": ["understood."]})
        contents.append({"role": "user", "parts": [prompt]})

        response = self.model.generate_content(contents)
        return response.text

    def stream(self, prompt, system="") -> Generator[str, None, None]:
        contents = []
        if system:
            contents.append({"role": "system", "parts": [system]})
            contents.append({"role": "user", "parts": ["understood."]})
        contents.append({"role": "user", "parts": [prompt]})

        response = self.model.generate_content(contents, stream=True)
        for chunk in response:
            if chunk.text:
                yield chunk.text
