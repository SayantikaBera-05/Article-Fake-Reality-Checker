"""
Analyst Service — OpenRouter External Verification Agent

A strict, objective Fact-Verification Agent ("AUDITOR-7") that verifies
claims using ONLY live, verified external data — zero reliance on
internal/pre-trained knowledge.

Pipeline:
    Phase 1: Search (Serper API) — formulates queries, retrieves results
    Phase 2: Content Extraction (Jina AI) — scrapes full-text evidence
    Phase 3: Cross-Examination (OpenRouter) — evaluates claim vs evidence

Uses OpenRouter API via the OpenAI SDK with streaming for real-time
console visibility during development.

Author: Joy-S-07
"""

import json
import re
import sys
import traceback
from typing import List, Optional

from openai import AsyncOpenAI

from app.config import settings
from app.schemas.detection import (
    FraudDetectionResponse,
    ConfidenceLevel,
    SourceReference,
    AuditTrail,
)
from app.services.scout import SearchResult
from app.services.reader import ScrapedContent


# ─── System Persona ────────────────────────────────

AUDITOR_SYSTEM_PROMPT = """You are AUDITOR-7, a strict, objective External Verification Agent at a global fact-checking bureau.

## CRITICAL DIRECTIVE: EXTERNAL EVIDENCE ONLY
- **Zero Reliance on Weights:** Do not use your own pre-trained internal knowledge, assumptions, or memory to verify ANY claim.
- **Always Deliver a Verdict:** You must ALWAYS return either VERIFIED or CONTRADICTED. There is no middle ground.
- If external evidence supports the claim -> VERIFIED.
- If external evidence contradicts, partially contradicts, OR cannot corroborate the claim -> CONTRADICTED.
- Absence of corroborating evidence IS itself a signal — a credible claim should be findable in reputable sources.
- You trust NOTHING at face value. Every claim must be cross-referenced against the EVIDENCE PROVIDED.
- Every source must be evaluated for credibility, recency, and bias.

Your analysis style:
- You speak in direct, authoritative language
- You cite specific evidence WITH exact source URLs when making judgments
- You flag logical fallacies, emotional manipulation, and unsupported claims
- You assess source credibility (e.g., Reuters > random blog, .gov > .com)
- You evaluate sources for recency, bias, and direct alignment with the claim
- If evidence is thin but no credible source supports the claim, you CONTRADICT it and explain why

You must respond ONLY with a valid JSON object. No markdown fences, no explanations outside the JSON."""


# ─── Evidence-Augmented Prompt ─────────────────────

INVESTIGATION_PROMPT = """CASE FILE -- EXTERNAL VERIFICATION REPORT
==============================

> CLAIM UNDER INVESTIGATION:
{claim}

> EVIDENCE RETRIEVED FROM WEB SOURCES (via Jina AI):
{evidence_block}

> SEARCH RESULTS CONTEXT (via Serper API):
{search_context}

==============================

INSTRUCTIONS:
You are performing Phase 3 (Cross-Examination & Synthesis) of the verification pipeline.
The evidence above was retrieved in real-time via Serper API (Phase 1) and scraped via Jina AI Reader (Phase 2).

Cross-reference the CLAIM against the EVIDENCE above. You must:
1. Evaluate the credibility of each source (checking for recency, bias, and direct alignment)
2. Find direct evidence that SUPPORTS or CONTRADICTS the claim
3. You MUST deliver a definitive verdict: VERIFIED or CONTRADICTED. There is no third option.

Return your verdict as a **valid JSON object** with exactly these keys:

{{
  "verificationStatus": "<one of: VERIFIED, CONTRADICTED>",
  "isFraud": <boolean -- true if CONTRADICTED/misleading/fabricated; false if VERIFIED>,
  "riskScore": <integer 0-100 -- 0=fully trustworthy, 100=completely fabricated>,
  "confidenceLevel": "<one of: Low, Medium, High, Critical>",
  "flags": ["<list of specific red flags, contradictions, unsupported claims, or credibility issues found -- each flag MUST cite the source URL>"],
  "analysisSummary": "<A 3-5 sentence forensic executive summary. Cite specific evidence that supports or contradicts the claim. Name the sources with their URLs. Explain your confidence level. State explicitly that this verdict is based on external evidence ONLY.>",
  "evidenceTimeline": ["<bulleted list of exact evidence found, each with markdown source link in format [Source Name](URL)>"]
}}

VERIFICATION STATUS RULES:
- VERIFIED: The claim is directly supported by credible external evidence from reputable sources
- CONTRADICTED: The claim is contradicted by evidence, lacks corroboration from any credible source, contains misleading/fabricated content, or cannot be substantiated by any reputable external source

SCORING GUIDELINES:
- 0-25: VERIFIED -- Claim is well-sourced, corroborated by multiple credible sources
- 26-50: VERIFIED (weak) -- Partially supported, minor inaccuracies, but core claim holds
- 51-75: CONTRADICTED (partial) -- Significant misleading content, cherry-picked data, or weak sourcing
- 76-100: CONTRADICTED (full) -- Fabricated, deliberately deceptive, contradicts all evidence

CRITICAL RULES:
- If evidence SUPPORTS the claim -> set verificationStatus to "VERIFIED", lower risk score
- If evidence CONTRADICTS the claim -> set verificationStatus to "CONTRADICTED", raise risk score
- If NO credible source corroborates the claim -> set verificationStatus to "CONTRADICTED" (absence of corroboration from any reputable source is itself a red flag)
- Do NOT use your internal knowledge. Base your verdict ONLY on the evidence provided above.
- Be fair. Sensational does not equal false. Verify before condemning.

Return ONLY the JSON object."""


# ─── Fallback Prompt (No External Evidence) ────────

FALLBACK_PROMPT = """CLAIM UNDER INVESTIGATION:
{claim}

CRITICAL NOTICE: No external evidence could be retrieved for this claim.
The Serper search and Jina AI scraping stages returned NO usable results.

This is itself a significant finding. A legitimate, factual claim from a credible source
should be discoverable via web search. The absence of ANY corroborating external source
is a strong indicator that the claim is unsupported, obscure, or fabricated.

You MUST still deliver a definitive verdict. Based on the ABSENCE of corroboration:

1. Set verificationStatus to "CONTRADICTED"
2. Clearly state that no external evidence could be found to support this claim
3. The inability to find ANY credible source is itself evidence against the claim
4. Do NOT attempt to verify using your own training data

Return your verdict as a **valid JSON object** with exactly these keys:

{{
  "verificationStatus": "CONTRADICTED",
  "isFraud": true,
  "riskScore": <integer 60-80 -- no corroborating sources found, high uncertainty>,
  "confidenceLevel": "Medium",
  "flags": ["No credible external source could corroborate this claim", "Absence of corroboration from reputable sources is a significant red flag"],
  "analysisSummary": "<2-3 sentences stating that no external evidence could be found to support this claim. Explain that a legitimate, well-sourced claim should be discoverable via web search, and the absence of ANY corroborating evidence is a red flag. State that this verdict is based on external verification ONLY.>",
  "evidenceTimeline": ["No external sources found to corroborate this claim via Serper search"]
}}

Return ONLY the JSON object."""


# ─── Analyst Agent ─────────────────────────────────


class Analyst:
    """
    OpenRouter-powered External Verification Agent.

    Performs strict, evidence-only fact-verification using a 3-phase pipeline:
        Phase 1: Search (Serper) -- handled by Scout
        Phase 2: Content Extraction (Jina AI) -- handled by Reader
        Phase 3: Cross-Examination (OpenRouter) -- THIS class

    When evidence is available (from Scout + Reader), the Analyst
    cross-references the claim against real-world sources ONLY.
    When evidence is unavailable, it marks the claim as CONTRADICTED
    (absence of corroboration is itself a red flag) — it does
    NOT fall back to internal knowledge.

    Usage:
        analyst = Analyst()
        verdict = await analyst.investigate(
            claim="NASA confirmed Earth is flat",
            evidence=[ScrapedContent(...)],
            search_results=[SearchResult(...)],
            serper_query="fact check NASA confirmed Earth is flat"
        )
    """

    def __init__(self):
        """Initialize the OpenRouter client via the AsyncOpenAI SDK."""
        api_key = settings.OPENROUTER_API_KEY
        if not api_key:
            raise RuntimeError(
                "OPENROUTER_API_KEY is not set in .env — cannot initialize Analyst."
            )

        # Build OpenRouter-specific headers
        extra_headers = {}
        if settings.OPENROUTER_SITE_URL:
            extra_headers["HTTP-Referer"] = settings.OPENROUTER_SITE_URL
        if settings.OPENROUTER_SITE_NAME:
            extra_headers["X-OpenRouter-Title"] = settings.OPENROUTER_SITE_NAME

        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url=settings.OPENROUTER_BASE_URL,
            default_headers=extra_headers if extra_headers else None,
        )
        self.model_name = settings.OPENROUTER_MODEL_NAME
        self.temperature = settings.OPENROUTER_TEMPERATURE

        print(f"[ANALYST] AUDITOR-7 initialized (async) -- model: {self.model_name}", flush=True)

    async def investigate(
        self,
        claim: str,
        evidence: Optional[List[ScrapedContent]] = None,
        search_results: Optional[List[SearchResult]] = None,
        serper_query: str = "",
    ) -> FraudDetectionResponse:
        """
        Perform strict external verification on the given claim.

        If evidence is available, constructs a cross-referenced prompt.
        Otherwise, returns CONTRADICTED (does NOT use internal knowledge).

        Args:
            claim: The user-submitted claim or article text.
            evidence: Scraped web content from the Reader stage.
            search_results: Raw search results from the Scout stage.
            serper_query: The actual Serper query used (for audit trail).

        Returns:
            A FraudDetectionResponse with verdict, risk score,
            flags, analysis summary, audit trail, and source references.
        """
        has_evidence = evidence and any(e.success for e in evidence)

        if has_evidence:
            prompt = self._build_evidence_prompt(claim, evidence, search_results)
        else:
            prompt = FALLBACK_PROMPT.format(claim=claim)

        # Build audit trail
        jina_urls = []
        if evidence:
            jina_urls = [e.url for e in evidence if e.success and e.url]

        audit_trail = AuditTrail(
            serperQuery=serper_query or f"fact check {claim.strip()[:300]}",
            jinaUrlsProcessed=jina_urls,
            openrouterModel=self.model_name,
        )

        try:
            # ─── Stream from OpenRouter ────────────────
            raw_text = await self._stream_completion(prompt)

            # ─── Parse the JSON response ───────────────
            parsed = self._parse_response(raw_text)

            # Build source references from search results
            sources = self._build_sources(search_results or [])

            # Extract verification status
            verification_status = parsed.get("verificationStatus", "CONTRADICTED")
            if verification_status not in ("VERIFIED", "CONTRADICTED"):
                verification_status = "CONTRADICTED"

            # Extract evidence timeline
            evidence_timeline = parsed.get("evidenceTimeline", [])
            if not isinstance(evidence_timeline, list):
                evidence_timeline = []

            return FraudDetectionResponse(
                verificationStatus=verification_status,
                isFraud=parsed.get("isFraud", False),
                riskScore=max(0, min(100, int(parsed.get("riskScore", 50)))),
                confidenceLevel=self._normalize_confidence(
                    parsed.get("confidenceLevel", "Medium")
                ),
                flags=parsed.get("flags", []),
                analysisSummary=parsed.get(
                    "analysisSummary",
                    "Analysis completed but summary was not generated.",
                ),
                evidenceTimeline=evidence_timeline,
                auditTrail=audit_trail,
                sources=sources,
            )

        except Exception as e:
            print(f"[ANALYST] WARNING: Error: {type(e).__name__}: {e}", file=sys.stderr, flush=True)
            traceback.print_exc()

            # ─── Build structured error response ──────────
            error_type = type(e).__name__
            error_msg = str(e)
            error_flags = [f"AI engine error: {error_type}"]
            error_summary = ""

            # Detect OpenAI/OpenRouter API errors with status codes
            status_code = getattr(e, "status_code", None)

            if status_code == 402:
                error_flags = [
                    "Error 402: Insufficient Credits",
                    f"Model requested: {self.model_name}",
                    "Action: Add credits at https://openrouter.ai/settings/credits or switch to a free model",
                ]
                error_summary = (
                    f"PAYMENT REQUIRED -- Your OpenRouter account does not have "
                    f"enough credits to run model '{self.model_name}'. "
                    f"Either add credits at https://openrouter.ai/settings/credits, "
                    f"reduce max_tokens, or switch to a free model like 'openrouter/auto'."
                )

            elif status_code == 404:
                error_flags = [
                    "Error 404: Model Not Found",
                    f"Model requested: {self.model_name}",
                    "Action: Check available models at https://openrouter.ai/models",
                ]
                error_summary = (
                    f"MODEL NOT FOUND -- The model '{self.model_name}' does not exist "
                    f"or has been deprecated on OpenRouter. Browse available models at "
                    f"https://openrouter.ai/models and update the OPENROUTER_MODEL_NAME "
                    f"environment variable."
                )

            elif status_code == 429:
                error_flags = [
                    "Error 429: Rate Limited",
                    f"Model: {self.model_name}",
                    "Action: Wait a moment and try again, or upgrade your plan",
                ]
                error_summary = (
                    f"RATE LIMITED -- Too many requests to OpenRouter. "
                    f"Free-tier accounts are limited to ~20 requests/minute. "
                    f"Please wait a moment and try again."
                )

            elif status_code == 401:
                error_flags = [
                    "Error 401: Authentication Failed",
                    "Action: Check your OPENROUTER_API_KEY in .env",
                ]
                error_summary = (
                    f"AUTHENTICATION FAILED -- Your OpenRouter API key is invalid "
                    f"or expired. Verify the OPENROUTER_API_KEY in your environment variables."
                )

            elif status_code and status_code >= 500:
                error_flags = [
                    f"Error {status_code}: OpenRouter Server Error",
                    f"Model: {self.model_name}",
                    "Action: This is a temporary issue on OpenRouter's side. Try again shortly.",
                ]
                error_summary = (
                    f"SERVER ERROR -- OpenRouter returned a {status_code} error. "
                    f"This is typically a temporary issue. Please try again in a few moments."
                )

            else:
                # Generic/unknown error
                error_flags = [
                    f"Error: {error_type}",
                    f"Model: {self.model_name}",
                    f"Details: {error_msg[:200]}",
                ]
                error_summary = (
                    f"UNEXPECTED ERROR -- {error_type}: {error_msg[:300]}. "
                    f"Please check the server logs for full details."
                )

            return FraudDetectionResponse(
                verificationStatus="CONTRADICTED",
                isFraud=True,
                riskScore=50,
                confidenceLevel=ConfidenceLevel.MEDIUM,
                flags=error_flags,
                analysisSummary=error_summary,
                evidenceTimeline=[],
                auditTrail=audit_trail,
                sources=[],
            )

    # ─── Prompt Construction ─────────────────────────

    def _build_evidence_prompt(
        self,
        claim: str,
        evidence: List[ScrapedContent],
        search_results: Optional[List[SearchResult]],
    ) -> str:
        """Assemble the investigation prompt with real evidence."""

        # Format scraped evidence
        evidence_parts: list[str] = []
        for idx, e in enumerate(evidence, 1):
            if e.success and e.markdown_content:
                evidence_parts.append(
                    f"-- Source {idx}: {e.title} --\n"
                    f"URL: {e.url}\n"
                    f"Content:\n{e.markdown_content}\n"
                )

        evidence_block = (
            "\n".join(evidence_parts)
            if evidence_parts
            else "[No web content could be scraped]"
        )

        # Format search result snippets
        search_parts: list[str] = []
        if search_results:
            for r in search_results[:5]:
                search_parts.append(f"* [{r.position}] {r.title}\n  {r.snippet}\n  {r.url}")

        search_context = (
            "\n".join(search_parts)
            if search_parts
            else "[No search results available]"
        )

        return INVESTIGATION_PROMPT.format(
            claim=claim,
            evidence_block=evidence_block,
            search_context=search_context,
        )

    # ─── OpenRouter Streaming ──────────────────────────

    async def _stream_completion(self, prompt: str) -> str:
        """
        Call OpenRouter with streaming enabled and assemble the full response.

        Uses AsyncOpenAI so that the asyncio event loop is NOT blocked
        while waiting for OpenRouter chunks. Writes directly to sys.stdout
        and calls sys.stdout.flush() to guarantee real-time chunks in the terminal.
        """
        print("\n[ANALYST] --- AUDITOR-7 STREAMING ---", flush=True)

        completion = await self.client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": AUDITOR_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=self.temperature,
            max_tokens=1536,
            top_p=0.95,
            stream=True,
        )

        # Assemble streamed chunks (async iteration)
        collected: list[str] = []
        async for chunk in completion:
            delta = chunk.choices[0].delta.content or ""
            collected.append(delta)

            # Write directly to system output and force flush OS buffer
            sys.stdout.write(delta)
            sys.stdout.flush()

        print("\n\n[ANALYST] --- END STREAM ---\n", flush=True)

        return "".join(collected).strip()

    # ─── Response Parsing ────────────────────────────

    def _parse_response(self, raw_text: str) -> dict:
        """
        Parse the LLM response, handling markdown fences or
        extraneous text around the JSON object.
        """
        cleaned = raw_text

        # Strip markdown code fences if present
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*\n?", "", cleaned)
            cleaned = re.sub(r"\n?```\s*$", "", cleaned)

        cleaned = cleaned.strip()

        # Extract the outermost JSON object if surrounded by stray text
        json_match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if json_match:
            cleaned = json_match.group(0)

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as exc:
            print(
                f"[ANALYST] WARNING: JSON parse failed — {exc}\n"
                f"Raw response (first 500 chars):\n{raw_text[:500]}",
                file=sys.stderr,
                flush=True,
            )
            # Return a safe fallback dict so the caller can still build a response
            return {
                "verificationStatus": "CONTRADICTED",
                "isFraud": True,
                "riskScore": 50,
                "confidenceLevel": "Medium",
                "flags": [f"JSON parse error: {exc}"],
                "analysisSummary": (
                    "The AI returned a response that could not be parsed as valid JSON. "
                    "This is an internal error — please check server logs for the raw output."
                ),
                "evidenceTimeline": [],
            }

    # ─── Confidence Normalizer ────────────────────────

    def _normalize_confidence(self, level: str) -> ConfidenceLevel:
        """Map raw string confidence level to the ConfidenceLevel enum."""
        mapping: dict[str, ConfidenceLevel] = {
            "low": ConfidenceLevel.LOW,
            "medium": ConfidenceLevel.MEDIUM,
            "high": ConfidenceLevel.HIGH,
            "critical": ConfidenceLevel.CRITICAL,
        }
        return mapping.get(level.strip().lower(), ConfidenceLevel.MEDIUM)

    # ─── Source Builder ───────────────────────────────

    def _build_sources(self, search_results: List[SearchResult]) -> List[SourceReference]:
        """Convert raw Serper search results into structured SourceReference objects."""
        sources: list[SourceReference] = []
        for r in search_results[:5]:
            sources.append(
                SourceReference(
                    title=r.title,
                    url=r.url,
                    snippet=r.snippet,
                )
            )
        return sources