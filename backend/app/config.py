from math import e
from os import access

from pydantic import BaseSettings


class Settings(BaseSettings):
    database_url: str
    redis_url: str
    chroma_host: str
    chroma_port: int
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    openai_api_key: str

    class Config:
        env_file = ".env"


settings = Settings()
