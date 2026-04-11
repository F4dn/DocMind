from transformers import pipeline
from app.core.llm.base import BaseLLM


class HuggingFaceLLM(BaseLLM):
    def __init__(self):
        self.pipe = pipeline(
            "text-generation",
            model="gpt2",  # you can change to better models
        )

    def generate(self, prompt: str) -> str:
        result = self.pipe(prompt, max_length=200, num_return_sequences=1)
        return result[0]["generated_text"]
