"""
Services package — Pipeline agents for fraud detection.

Contains the core RAG pipeline agents:
    - detector: Pipeline orchestrator (Scout → Reader → Analyst)
    - scout: Serper.dev search agent
    - reader: Jina AI web scraper
    - analyst: OpenRouter LLM cross-examiner
    - image_analyzer: Image content extraction (OCR + Vision)
"""

from app.services.detector import FraudDetector
from app.services.scout import Scout, SearchResult
from app.services.reader import Reader, ScrapedContent
from app.services.analyst import Analyst
from app.services.image_analyzer import ImageContentExtractor

__all__ = [
    "FraudDetector",
    "Scout",
    "SearchResult",
    "Reader",
    "ScrapedContent",
    "Analyst",
    "ImageContentExtractor",
]
