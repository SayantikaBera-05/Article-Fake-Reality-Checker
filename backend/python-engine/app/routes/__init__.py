"""
Routes package — API endpoint handlers.

Contains all FastAPI route modules:
    - detection: POST /detect (synchronous analysis)
    - sse: POST /detect/stream (SSE streaming pipeline)
    - image_sse: POST /image/stream + GET /image-checker (image pipeline)
"""

from app.routes import detection, sse, image_sse

__all__ = [
    "detection",
    "sse",
    "image_sse",
]
