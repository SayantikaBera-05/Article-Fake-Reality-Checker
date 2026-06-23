"""
Uvicorn entry point for the Fraud Detection Engine.
Run with: python run.py
"""

import os
import sys

# ─── Fix Windows Unicode console encoding ──────────
# Windows uses cp1252 by default, which crashes on Unicode box-drawing
# characters (─, ═, ▸) used in pipeline log output. Force UTF-8.
os.environ["PYTHONIOENCODING"] = "utf-8"
os.environ["PYTHONUNBUFFERED"] = "1"
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace", write_through=True)
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace", write_through=True)

import uvicorn
from app.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=True,
        log_level="info",
    )

