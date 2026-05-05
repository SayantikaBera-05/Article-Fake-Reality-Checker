"""
Fraud Detection Engine — Main Application
FastAPI-based microservice for fraud analysis and risk scoring.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.config import settings
from app.routes import detection


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle manager — load ML models on startup."""
    print("[STARTUP] Fraud Detection Engine starting up...")
    # Load ML model or external API client on startup
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

# ─── CORS ───────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Global Exception Handler ──────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": f"Internal server error: {str(exc)}",
            "type": type(exc).__name__,
        },
    )


# ─── Health Check ──────────────────────────────────
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "python-engine",
        "version": "1.0.0",
    }


# ─── Register Routes ──────────────────────────────
app.include_router(detection.router)
