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
    # OpenRouter model configuration
    OPENROUTER_API_KEY: Optional[str] = None
    ALLOWED_ORIGINS: str = "http://localhost:5000"
    OPENROUTER_MODEL_NAME: str = "openrouter/auto"
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_TEMPERATURE: float = 0.3
    OPENROUTER_SITE_URL: Optional[str] = None   # For OpenRouter rankings
    OPENROUTER_SITE_NAME: Optional[str] = None   # For OpenRouter rankings

    # Search configuration (Serper.dev)
    SERPER_API_KEY: Optional[str] = None
    SERPER_ENDPOINT: str = "https://google.serper.dev/search"
    SERPER_NUM_RESULTS: int = 5

    # Scraper configuration (Jina AI Reader)
    JINA_READER_BASE_URL: str = "https://r.jina.ai"
    JINA_TIMEOUT: int = 15  # seconds

    # Pipeline configuration
    ENABLE_RAG_PIPELINE: bool = True  # Toggle RAG vs. legacy analysis-only

    # ─── Image Reality Checker ──────────────────────
    # Sightengine API (AI-generated image detection)
    SIGHTENGINE_API_USER: Optional[str] = None
    SIGHTENGINE_API_SECRET: Optional[str] = None
    SIGHTENGINE_ENDPOINT: str = "https://api.sightengine.com/1.0/check.json"

    # LLaMA Vision Model (fallback content extraction)
    LLAMA_VISION_MODEL: str = "meta-llama/llama-4-scout-17b-16e-instruct"


    class Config:
        env_file = str(_ENV_FILE)
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
