"""
Application configuration using Pydantic Settings.
Reads from environment variables and .env file.
"""

from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional

# Resolve the .env file relative to this config file → python-engine/.env
_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    PORT: int = 8000
    GROQ_API_KEY: Optional[str] = None
    MODEL_PATH: Optional[str] = None
    ALLOWED_ORIGINS: str = "http://localhost:5000"

    # Groq model configuration
    GROQ_MODEL_NAME: str = "llama-3.1-8b-instant"
    GROQ_TEMPERATURE: float = 0.3

    # Search configuration (Serper.dev)
    SERPER_API_KEY: Optional[str] = None
    SERPER_ENDPOINT: str = "https://google.serper.dev/search"
    SERPER_NUM_RESULTS: int = 5

    # Scraper configuration (Jina AI Reader)
    JINA_READER_BASE_URL: str = "https://r.jina.ai"
    JINA_TIMEOUT: int = 15  # seconds

    # Pipeline configuration
    ENABLE_RAG_PIPELINE: bool = True  # Toggle RAG vs. legacy analysis-only

    class Config:
        env_file = str(_ENV_FILE)
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
