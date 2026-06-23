"""
Fraud Detection Engine — Main Application
FastAPI-based microservice for fraud analysis and risk scoring.
"""

import sys
import os

# ─── Fix Windows Unicode console encoding ──────────────────
# Print patching is handled entirely by app/__init__.py (with sentinel guard).
# Do NOT add a print() patch here — on uvicorn --reload, main.py re-executes
# but app/__init__.py does not, so any patch here wins permanently after the
# first reload and will override the guarded stderr-routing patch in __init__.py.
os.environ["PYTHONIOENCODING"] = "utf-8"
os.environ["PYTHONUNBUFFERED"] = "1"

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace", write_through=True)
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace", write_through=True)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.config import settings
from app.routes import detection
from app.routes import sse
from app.routes import image_sse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle manager — load ML models on startup."""
    print("[STARTUP] Fraud Detection Engine starting up...")
    from app.services.detector import FraudDetector
    app.state.detector = FraudDetector()
    print("[READY] Fraud detection model loaded successfully")
    yield
    print("[SHUTDOWN] Fraud Detection Engine shutting down...")


app = FastAPI(
    title="Fraud Detection Engine",
    description="AI-powered fraud detection microservice for analyzing transactions and behavior",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ───────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Global Exception Handler ───────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": f"Internal server error: {str(exc)}",
            "type": type(exc).__name__,
        },
    )


# ─── Health Check ────────────────────────────────────────────
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "python-engine",
        "version": "1.0.0",
    }


# ─── Register Routes ─────────────────────────────────────────
app.include_router(detection.router)
app.include_router(sse.router)
app.include_router(image_sse.router)