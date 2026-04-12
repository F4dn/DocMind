from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    redis_url: str
    chroma_host: str
    chroma_port: int
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    gemini_api_key: str | None = None
    embedding_provider: str = "openai"
    openai_api_key: str | None = None
    llm_provider: str = "gemini"

    class Config:
        env_file = ".env"


settings = Settings()
