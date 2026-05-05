"""
Application configuration using Pydantic Settings.
Reads from environment variables and .env file.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PORT: int = 8000
    MODEL_API_KEY: Optional[str] = None
    MODEL_PATH: Optional[str] = None
    ALLOWED_ORIGINS: str = "http://localhost:5000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
