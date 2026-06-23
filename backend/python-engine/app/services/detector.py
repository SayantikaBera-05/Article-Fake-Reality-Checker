"""
Fraud Detector — Pipeline Orchestrator

Chains the three RAG pipeline stages together:
    Scout (Serper) -> Reader (Jina) -> Analyst (OpenRouter AUDITOR-7)

Strict external verification pipeline: when the RAG pipeline is enabled
and Serper is configured, the orchestrator retrieves real-time evidence
before analysis. If evidence is unavailable, the Analyst marks the claim as
CONTRADICTED -- it does NOT fall back to internal knowledge.

Author: Joy-S-07
"""

import traceback

from app.config import settings
from app.schemas.detection import (
    FraudDetectionRequest,
    FraudDetectionResponse,
    ConfidenceLevel,
)
from app.services.scout import Scout
from app.services.reader import Reader
from app.services.analyst import Analyst


class FraudDetector:
    """
    Pipeline orchestrator — chains Scout -> Reader -> Analyst.

    On init, creates instances of all three agents. On each call
    to `analyze()`, runs the full pipeline:

    1. **Scout**: Searches Google for the claim via Serper.dev
    2. **Reader**: Scrapes the top result(s) into Markdown via Jina AI
    3. **Analyst**: Cross-references claim vs. evidence via OpenRouter

    If the RAG pipeline is disabled or the Scout has no API key,
    the Analyst falls back to internal-knowledge analysis.
    """

    def __init__(self):
        """Initialize all three pipeline agents."""
        self.scout = Scout()
        self.reader = Reader()
        self.analyst = Analyst()

        self.rag_enabled = settings.ENABLE_RAG_PIPELINE

        if self.rag_enabled and self.scout.is_available:
            print("[DETECTOR] OK: Full RAG pipeline active (Scout -> Reader -> Analyst)", flush=True)
        elif self.rag_enabled:
            print("[DETECTOR] WARNING: RAG enabled but no SERPER_API_KEY — Analyst-only mode", flush=True)
        else:
            print("[DETECTOR] RAG pipeline disabled — Analyst-only mode", flush=True)

    async def analyze(self, payload: FraudDetectionRequest) -> FraudDetectionResponse:
        """
        Run the full fraud detection pipeline on the incoming payload.

        The method signature and return type are identical to the legacy
        detector, ensuring the route handler and Node gateway need zero changes.

        Args:
            payload: The incoming detection request from the Node gateway.

        Returns:
            A FraudDetectionResponse with verdict, risk score, and sources.
        """
        claim = payload.description or ""

        # Guard: no content provided
        if not claim.strip():
            return FraudDetectionResponse(
                isFraud=False,
                riskScore=0,
                confidenceLevel=ConfidenceLevel.LOW,
                flags=["No content was provided for analysis"],
                analysisSummary=(
                    "No article text or claim was submitted. "
                    "Please provide content to verify."
                ),
                sources=[],
            )

        # ─── Stage 1: Scout (Search) ───────────────
        search_results = []
        serper_query = f"fact check {claim.strip()[:300]}"
        if self.rag_enabled and self.scout.is_available:
            try:
                print(f"\n{'═' * 60}", flush=True)
                print(f"[PIPELINE] Stage 1/3 — SCOUT: Searching for evidence...", flush=True)
                print(f"{'═' * 60}", flush=True)
                search_results = await self.scout.search(claim)
            except Exception as e:
                print(f"[PIPELINE] WARNING: Scout failed: {type(e).__name__}: {e}", flush=True)
                traceback.print_exc()

        # ─── Stage 2: Reader (Scrape) ──────────────
        evidence = []
        if search_results:
            try:
                print(f"\n{'═' * 60}", flush=True)
                print(f"[PIPELINE] Stage 2/3 — READER: Scraping top sources...", flush=True)
                print(f"{'═' * 60}", flush=True)

                # Extract URLs from search results
                urls = [r.url for r in search_results if r.url]
                evidence = await self.reader.scrape_multiple(urls, max_sources=2)
            except Exception as e:
                print(f"[PIPELINE] WARNING: Reader failed: {type(e).__name__}: {e}", flush=True)
                traceback.print_exc()

        # ─── Stage 3: Analyst (Investigate) ────────
        try:
            print(f"\n{'═' * 60}", flush=True)
            mode = "EVIDENCE-BACKED" if evidence else "INTERNAL-KNOWLEDGE"
            print(f"[PIPELINE] Stage 3/3 — ANALYST: {mode} investigation...", flush=True)
            print(f"{'═' * 60}", flush=True)

            verdict = await self.analyst.investigate(
                claim=claim,
                evidence=evidence if evidence else None,
                search_results=search_results if search_results else None,
                serper_query=serper_query,
            )

            print(f"\n{'═' * 60}", flush=True)
            print(f"[PIPELINE] OK: VERDICT: {'FRAUD' if verdict.isFraud else 'LEGITIMATE'} "
                  f"(risk: {verdict.riskScore}/100, confidence: {verdict.confidenceLevel.value})",
                  flush=True)
            print(f"{'═' * 60}\n", flush=True)

            return verdict

        except Exception as e:
            print(f"[PIPELINE] FAIL: Analyst failed: {type(e).__name__}: {e}", flush=True)
            traceback.print_exc()

            return FraudDetectionResponse(
                isFraud=False,
                riskScore=50,
                confidenceLevel=ConfidenceLevel.MEDIUM,
                flags=[f"Pipeline error: {type(e).__name__}"],
                analysisSummary=(
                    f"The fraud detection pipeline encountered an error: {str(e)}. "
                    f"The content could not be fully analyzed. Please try again."
                ),
                sources=[],
            )