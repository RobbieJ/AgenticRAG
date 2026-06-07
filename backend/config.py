from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # API Configuration
    API_TITLE: str = "Agentic RAG Demo API"
    API_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Anthropic Configuration
    ANTHROPIC_API_KEY: str
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"

    # Weaviate Configuration
    WEAVIATE_URL: str = "http://localhost:8080"
    WEAVIATE_API_KEY: Optional[str] = None

    # Demo Configuration
    DEMO_MAX_ITERATIONS: int = 5
    DEMO_EVALUATION_THRESHOLD: float = 0.7

    # CORS Configuration
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:8000"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
