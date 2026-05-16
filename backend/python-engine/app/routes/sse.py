"""
SSE Streaming Route — POST /detect/stream

Streams real-time Server-Sent Events as the fraud detection pipeline
progresses through each stage. The Python engine is the absolute source
of truth for timing — events are emitted exactly when each stage begins.

Architecture:
    Client → POST /detect/stream → Python yields SSE events →
    Node gateway proxies the stream → React frontend renders stages

Event Types:
    event: stage      → Pipeline stage transition (SCOUT, READER, ANALYST, VERDICT)
    event: completed  → Full fraud detection result (JSON)
    event: error      → Pipeline error message

Author: Joy-S-07
"""

import json
import traceback
from typing import AsyncGenerator

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from app.config import settings
from app.schemas.detection import (
    FraudDetectionRequest,
    FraudDetectionResponse,
    ConfidenceLevel,
)
from app.services.scout import Scout
from app.services.reader import Reader
from app.services.analyst import Analyst

router = APIRouter()


# ─── SSE Helpers ────────────────────────────────────

def sse_event(event: str, data: dict) -> str:
    """Format a Server-Sent Event string."""
    json_data = json.dumps(data, default=str)
    return f"event: {event}\ndata: {json_data}\n\n"


def sse_stage(stage: str, sequence: int, text: str) -> str:
    """Emit a pipeline stage transition event."""
    return sse_event("stage", {
        "stage": stage,
        "sequence": sequence,
        "text": text,
    })


def sse_completed(result: FraudDetectionResponse) -> str:
    """Emit the final completed event with the full result."""
    return sse_event("completed", {
        "result": result.model_dump(),
    })


def sse_error(message: str) -> str:
    """Emit an error event."""
    return sse_event("error", {
        "message": message,
    })


# ─── SSE Pipeline Generator ────────────────────────

async def pipeline_stream(
    payload: FraudDetectionRequest,
    detector_scout: Scout,
    detector_reader: Reader,
    detector_analyst: Analyst,
    rag_enabled: bool,
) -> AsyncGenerator[str, None]:
    """
    Async generator that runs the fraud detection pipeline and yields
    SSE events at each stage transition. This is the core streaming
    engine — each yield happens in real-time as the pipeline progresses.
    """
    claim = payload.description or ""

    # Guard: no content provided
    if not claim.strip():
        yield sse_completed(FraudDetectionResponse(
            isFraud=False,
            riskScore=0,
            confidenceLevel=ConfidenceLevel.LOW,
            flags=["No content was provided for analysis"],
            analysisSummary=(
                "No article text or claim was submitted. "
                "Please provide content to verify."
            ),
            sources=[],
        ))
        return

    try:
        # --- Stage 1: SCOUT -- Search for evidence (News-first) ---
        yield sse_stage("SCOUT", 1, "Searching for evidence...")
        serper_query = f"fact check {claim.strip()[:300]}"
        print(f"\n{'=' * 60}")
        print(f"[SSE PIPELINE] Stage 1/4 -- SCOUT: Searching for evidence...")
        print(f"{'=' * 60}")

        search_results = []

        # Step 1a: Try NewsAPI first (news-first verification)
        if rag_enabled and detector_scout.is_news_available:
            try:
                print(f"[SSE PIPELINE] Stage 1a -- NEWS SEARCH (NewsAPI.org)...")
                search_results = await detector_scout.search_news(claim)
                if search_results:
                    print(f"[SSE PIPELINE] ✓ Found {len(search_results)} news articles")
                else:
                    print(f"[SSE PIPELINE] ✗ No news articles — falling back to web search")
            except Exception as e:
                print(f"[SSE PIPELINE] WARNING: NewsAPI failed: {type(e).__name__}: {e}")
                traceback.print_exc()

        # Step 1b: Fall back to Serper web search
        if not search_results and rag_enabled and detector_scout.is_available:
            try:
                print(f"[SSE PIPELINE] Stage 1b -- WEB SEARCH (Serper.dev)...")
                search_results = await detector_scout.search(claim)
            except Exception as e:
                print(f"[SSE PIPELINE] WARNING: Scout failed: {type(e).__name__}: {e}")
                traceback.print_exc()

        # --- Stage 2: READER -- Scrape top sources -------
        yield sse_stage("READER", 2, "Extracting content from sources...")
        print(f"\n{'=' * 60}")
        print(f"[SSE PIPELINE] Stage 2/4 -- READER: Extracting via Jina AI...")
        print(f"{'=' * 60}")

        evidence = []
        if search_results:
            try:
                urls = [r.url for r in search_results if r.url]
                evidence = await detector_reader.scrape_multiple(urls, max_sources=2)
            except Exception as e:
                print(f"[SSE PIPELINE] WARNING: Reader failed: {type(e).__name__}: {e}")
                traceback.print_exc()

        # --- Stage 3: ANALYST -- Cross-examination -------
        mode = "EVIDENCE-BACKED" if evidence else "NO-EVIDENCE"
        yield sse_stage("ANALYST", 3, f"Cross-examining claim ({mode})...")
        print(f"\n{'=' * 60}")
        print(f"[SSE PIPELINE] Stage 3/4 -- ANALYST: {mode} verification...")
        print(f"{'=' * 60}")

        verdict = await detector_analyst.investigate(
            claim=claim,
            evidence=evidence if evidence else None,
            search_results=search_results if search_results else None,
            serper_query=serper_query,
        )

        # --- Stage 4: VERDICT -- Finalize ----------------
        yield sse_stage("VERDICT", 4, "Compiling Verification Report...")
        print(f"\n{'=' * 60}")
        print(f"[SSE PIPELINE] Stage 4/4 -- VERDICT: Compiling report...")
        print(f"{'=' * 60}")

        print(f"\n{'=' * 60}")
        print(f"[SSE PIPELINE] OK: STATUS: {verdict.verificationStatus} "
              f"(risk: {verdict.riskScore}/100, confidence: {verdict.confidenceLevel.value})")
        print(f"{'=' * 60}\n")

        # --- Final: Emit completed event -----------------
        yield sse_completed(verdict)

    except Exception as e:
        print(f"[SSE PIPELINE] FAIL: {type(e).__name__}: {e}")
        traceback.print_exc()

        # Emit error, then a fallback completed event
        yield sse_error(f"Pipeline error: {type(e).__name__}: {str(e)}")
        yield sse_completed(FraudDetectionResponse(
            isFraud=False,
            riskScore=50,
            confidenceLevel=ConfidenceLevel.MEDIUM,
            flags=[f"Pipeline error: {type(e).__name__}"],
            analysisSummary=(
                f"The fraud detection pipeline encountered an error: {str(e)}. "
                f"The content could not be fully analyzed. Please try again."
            ),
            sources=[],
        ))


# ─── SSE Endpoint ──────────────────────────────────

@router.post(
    "/detect/stream",
    summary="Stream fraud analysis via SSE",
    description=(
        "Accepts transaction details and streams real-time pipeline stage "
        "events via Server-Sent Events. The frontend should consume this "
        "stream to show live progress without any hardcoded timers."
    ),
)
async def detect_fraud_stream(
    payload: FraudDetectionRequest,
    request: Request,
):
    """
    SSE streaming endpoint — the source of truth for pipeline timing.

    Returns a text/event-stream response that yields events as each
    pipeline stage (Scout, Reader, Analyst, Verdict) begins and completes.
    """
    detector = request.app.state.detector

    return StreamingResponse(
        pipeline_stream(
            payload=payload,
            detector_scout=detector.scout,
            detector_reader=detector.reader,
            detector_analyst=detector.analyst,
            rag_enabled=detector.rag_enabled,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Prevent Nginx buffering
            "Access-Control-Allow-Origin": "*",
        },
    )
