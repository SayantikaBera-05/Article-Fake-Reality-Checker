"""
Analyst Service — OpenRouter Auditor Agent

The core LLM analysis engine that adopts a skeptical, clinical
fraud investigator persona ("AUDITOR-7"). Ingests both the user's
claim AND real-time evidence retrieved by Scout + Reader, then
cross-references them to produce a grounded verdict.

Uses OpenRouter API via the OpenAI SDK with streaming for real-time
console visibility during development.

Author: Joy-S-07
"""

import json
import re
import traceback
from typing import List, Optional

from openai import AsyncOpenAI

from app.config import settings
from app.schemas.detection import (
    FraudDetectionResponse,
    ConfidenceLevel,
    SourceReference,
)
from app.services.scout import SearchResult
from app.services.reader import ScrapedContent


# ─── System Persona ────────────────────────────────

AUDITOR_SYSTEM_PROMPT = """You are AUDITOR-7, a senior forensic fraud investigator at a global fact-checking bureau.

You are clinical, skeptical, and precise. You trust NOTHING at face value.
Every claim must be cross-referenced against evidence. Every source must be evaluated for credibility.

Your analysis style:
- You speak in direct, authoritative language
- You cite specific evidence when making judgments
- You flag logical fallacies, emotional manipulation, and unsupported claims
- You distinguish between "unverified" and "false" — they are NOT the same
- You assess source credibility (e.g., Reuters > random blog)
- You NEVER speculate — if evidence is insufficient, you say so

You must respond ONLY with a valid JSON object. No markdown fences, no explanations outside the JSON."""


# ─── Evidence-Augmented Prompt ─────────────────────

INVESTIGATION_PROMPT = """CASE FILE — CLAIM VERIFICATION
══════════════════════════════

▸ CLAIM UNDER INVESTIGATION:
{claim}

▸ EVIDENCE RETRIEVED FROM WEB SOURCES:
{evidence_block}

▸ SEARCH RESULTS CONTEXT:
{search_context}

══════════════════════════════

INSTRUCTIONS:
Cross-reference the CLAIM against the EVIDENCE above. Assess whether the claim
is factually accurate, misleading, fabricated, or unverifiable.

Return your verdict as a **valid JSON object** with exactly these keys:

{{
  "isFraud": <boolean — true if misleading/fabricated/significant misinformation; false if factually accurate or unverifiable>,
  "riskScore": <integer 0–100 — 0=fully trustworthy, 100=completely fabricated>,
  "confidenceLevel": "<one of: Low, Medium, High, Critical>",
  "flags": ["<list of specific red flags, contradictions, unsupported claims, or credibility issues found>"],
  "analysisSummary": "<A detailed 3–5 sentence forensic analysis. Cite specific evidence that supports or contradicts the claim. Name the sources you referenced. Explain your confidence level.>"
}}

SCORING GUIDELINES:
- 0–25: Claim is well-sourced, corroborated by credible evidence
- 26–50: Minor inaccuracies or claims that cannot be fully verified
- 51–75: Significant misleading content, cherry-picked data, or unsupported assertions
- 76–100: Fabricated, deliberately deceptive, or contradicts all available evidence

CRITICAL RULES:
- If evidence SUPPORTS the claim → lower the risk score
- If evidence CONTRADICTS the claim → raise the risk score
- If NO evidence is available → set confidenceLevel to "Low" and note insufficient data
- Be fair. Sensational ≠ false. Verify before condemning.

Return ONLY the JSON object."""


# ─── Fallback Prompt (No Evidence) ─────────────────

FALLBACK_PROMPT = """CLAIM UNDER INVESTIGATION:
{claim}

You have NO external evidence available for this claim. Analyze it based solely
on your internal knowledge. Be transparent that this analysis is NOT evidence-backed.

Return your verdict as a **valid JSON object** with exactly these keys:

{{
  "isFraud": <boolean>,
  "riskScore": <integer 0–100>,
  "confidenceLevel": "<one of: Low, Medium, High, Critical>",
  "flags": ["<list of red flags or concerns>"],
  "analysisSummary": "<3–5 sentence analysis. Clearly state that no external evidence was available and this verdict is based on internal knowledge only.>"
}}

Return ONLY the JSON object."""


# ─── Analyst Agent ─────────────────────────────────


class Analyst:
    """
    OpenRouter-powered Auditor agent — performs deep fraud analysis.

    When evidence is available (from Scout + Reader), the Analyst
    cross-references the claim against real-world sources. When
    evidence is unavailable, it falls back to internal-knowledge
    analysis with an explicit confidence caveat.

    Uses OpenRouter's streaming API for real-time console output during
    development, then assembles the full response for the API.

    Usage:
        analyst = Analyst()
        verdict = await analyst.investigate(
            claim="NASA confirmed Earth is flat",
            evidence=[ScrapedContent(...)],
            search_results=[SearchResult(...)]
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

        print(f"[ANALYST] AUDITOR-7 initialized (async) — model: {self.model_name}")

    async def investigate(
        self,
        claim: str,
        evidence: Optional[List[ScrapedContent]] = None,
        search_results: Optional[List[SearchResult]] = None,
    ) -> FraudDetectionResponse:
        """
        Perform a deep fraud investigation on the given claim.

        If evidence is available, constructs a cross-referenced prompt.
        Otherwise, falls back to internal-knowledge analysis.

        Args:
            claim: The user-submitted claim or article text.
            evidence: Scraped web content from the Reader stage.
            search_results: Raw search results from the Scout stage.

        Returns:
            A FraudDetectionResponse with the verdict, risk score,
            flags, analysis summary, and source references.
        """
        has_evidence = evidence and any(e.success for e in evidence)

        if has_evidence:
            prompt = self._build_evidence_prompt(claim, evidence, search_results)
        else:
            prompt = FALLBACK_PROMPT.format(claim=claim)

        try:
            # ─── Stream from OpenRouter ────────────────
            raw_text = await self._stream_completion(prompt)

            # ─── Parse the JSON response ───────────────
            parsed = self._parse_response(raw_text)

            # Build source references from search results
            sources = self._build_sources(search_results or [])

            return FraudDetectionResponse(
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
                sources=sources,
            )

        except Exception as e:
            print(f"[ANALYST] WARNING: Error: {type(e).__name__}: {e}")
            traceback.print_exc()

            return FraudDetectionResponse(
                isFraud=False,
                riskScore=50,
                confidenceLevel=ConfidenceLevel.MEDIUM,
                flags=[f"AI engine error: {type(e).__name__}"],
                analysisSummary=(
                    f"The AUDITOR-7 engine encountered an error while processing "
                    f"your request: {str(e)}. The content could not be fully analyzed. "
                    f"Please try again or check the server logs for details."
                ),
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
                    f"── Source {idx}: {e.title} ──\n"
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
                search_parts.append(f"• [{r.position}] {r.title}\n  {r.snippet}\n  {r.url}")

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
        while waiting for OpenRouter chunks. This is critical — the previous
        synchronous client caused uvicorn to hang, timing out the Node
        gateway and triggering a 502 on the frontend.

        Streams chunks to stdout for real-time development visibility.
        Returns the fully assembled response text.
        """
        print("\n[ANALYST] ─── AUDITOR-7 STREAMING ───")

        completion = await self.client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": AUDITOR_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=self.temperature,
            max_tokens=1024,
            top_p=0.95,
            stream=True,
        )

        # Assemble streamed chunks (async iteration)
        collected: list[str] = []
        async for chunk in completion:
            delta = chunk.choices[0].delta.content or ""
            collected.append(delta)
            print(delta, end="", flush=True)

        print("\n[ANALYST] ─── END STREAM ─────────────\n")

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
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
            cleaned = re.sub(r"\s*```$", "", cleaned)

        # Try direct parse
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass

        # Fallback: find the first { ... } block
        match = re.search(r"\{[\s\S]*\}", cleaned)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass

        # Last resort: structured fallback
        print(f"[ANALYST] WARNING: Could not parse JSON. Raw: {raw_text[:500]}")
        return {
            "isFraud": False,
            "riskScore": 50,
            "confidenceLevel": "Medium",
            "flags": ["Could not parse AI response"],
            "analysisSummary": raw_text[:1000],
        }

    def _normalize_confidence(self, value: str) -> ConfidenceLevel:
        """Map the model's confidence string to the enum, with fallback."""
        mapping = {
            "low": ConfidenceLevel.LOW,
            "medium": ConfidenceLevel.MEDIUM,
            "high": ConfidenceLevel.HIGH,
            "critical": ConfidenceLevel.CRITICAL,
        }
        return mapping.get(value.lower().strip(), ConfidenceLevel.MEDIUM)

    def _build_sources(self, search_results: List[SearchResult]) -> List[SourceReference]:
        """Convert SearchResult objects into SourceReference schema objects."""
        return [
            SourceReference(
                title=r.title,
                url=r.url,
                snippet=r.snippet,
            )
            for r in search_results[:5]
        ]
