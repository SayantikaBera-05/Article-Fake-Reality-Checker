"""
Image Analyzer Service — Full Image Reality Check Pipeline

Three async service modules in one file:
    1. SightEngineChecker  — AI-generated image detection via Sightengine
    2. ImageContentExtractor — OCR (pytesseract) + LLaMA Vision fallback
    3. run_custom_reality_check() — Uses AUDITOR-7 for reality verification

All external network requests use async httpx clients with proper
async/await so that one user's wait-time never blocks other concurrent
users on the event loop.

Author: Joy-S-07
"""

import asyncio
import base64
import io
import json
import re
import sys
import traceback
from typing import Optional

import httpx
from PIL import Image

from app.config import settings
from app.schemas.image_detection import (
    AIDetectionResult,
    ContentExtractionResult,
    ImageAnalysisResult,
    ImageVerdict,
    ImageConfidenceLevel,
)

# Attempt to import pytesseract — graceful fallback if not installed
try:
    import pytesseract

    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    print("[IMAGE] WARNING: pytesseract not installed — OCR will be skipped", flush=True)


# ═══════════════════════════════════════════════════════
# 1. SIGHTENGINE — AI Generation Detection
# ═══════════════════════════════════════════════════════


class SightEngineChecker:
    """
    Async client for the Sightengine AI-generated image detection API.

    Sends the uploaded image to Sightengine's `genai` model and returns
    a confidence score indicating how likely the image is AI-generated.

    Usage:
        checker = SightEngineChecker()
        result = await checker.check(image_bytes, "image.jpg")
    """

    def __init__(self):
        self.api_user: Optional[str] = settings.SIGHTENGINE_API_USER
        self.api_secret: Optional[str] = settings.SIGHTENGINE_API_SECRET
        self.endpoint: str = settings.SIGHTENGINE_ENDPOINT

        if self.is_available:
            print("[SIGHTENGINE] AI detection agent initialized", flush=True)
        else:
            print("[SIGHTENGINE] WARNING: No credentials — AI detection will be skipped", flush=True)

    @property
    def is_available(self) -> bool:
        """Check if valid Sightengine credentials are configured."""
        return bool(
            self.api_user
            and self.api_secret
            and self.api_user != "YOUR_SIGHTENGINE_API_USER"
        )

    async def check(self, image_bytes: bytes, filename: str) -> AIDetectionResult:
        """
        Check whether an image is AI-generated using the Sightengine API.

        Args:
            image_bytes: Raw bytes of the uploaded image.
            filename: Original filename for the multipart upload.

        Returns:
            AIDetectionResult with is_ai_generated flag and confidence score.
        """
        if not self.is_available:
            print("[SIGHTENGINE] Skipped — no credentials configured", flush=True)
            return AIDetectionResult(
                is_ai_generated=False,
                ai_score=0.0,
                details={"skipped": True, "reason": "No Sightengine credentials"},
            )

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.endpoint,
                    data={
                        "models": "genai",
                        "api_user": self.api_user,
                        "api_secret": self.api_secret,
                    },
                    files={
                        "media": (filename, image_bytes, "image/jpeg"),
                    },
                )
                response.raise_for_status()
                data = response.json()

            # Parse the Sightengine response
            ai_score = 0.0
            if "type" in data:
                ai_generated = data["type"].get("ai_generated", 0.0)
                ai_score = float(ai_generated)

            is_ai = ai_score > 0.5

            print(
                f"[SIGHTENGINE] AI score: {ai_score:.3f} → "
                f"{'AI-GENERATED' if is_ai else 'REAL IMAGE'}",
                flush=True,
            )

            return AIDetectionResult(
                is_ai_generated=is_ai,
                ai_score=ai_score,
                details=data,
            )

        except httpx.TimeoutException:
            print("[SIGHTENGINE] WARNING: Request timed out", flush=True)
            return AIDetectionResult(
                is_ai_generated=False,
                ai_score=0.0,
                details={"error": "timeout"},
            )
        except httpx.HTTPStatusError as e:
            print(
                f"[SIGHTENGINE] WARNING: HTTP {e.response.status_code}: "
                f"{e.response.text[:200]}",
                flush=True,
            )
            return AIDetectionResult(
                is_ai_generated=False,
                ai_score=0.0,
                details={"error": f"HTTP {e.response.status_code}"},
            )
        except Exception as e:
            print(f"[SIGHTENGINE] WARNING: {type(e).__name__}: {e}", flush=True)
            traceback.print_exc()
            return AIDetectionResult(
                is_ai_generated=False,
                ai_score=0.0,
                details={"error": str(e)},
            )


# ═══════════════════════════════════════════════════════
# 2. IMAGE CONTENT EXTRACTOR — OCR + Vision Fallback
# ═══════════════════════════════════════════════════════


class ImageContentExtractor:
    """
    Two-stage content extraction from images:
        1. OCR First — pytesseract for any written text
        2. Vision Fallback — LLaMA 4 Scout for scene description

    Both stages are fully async: OCR runs via asyncio.to_thread(),
    and the vision model uses async httpx.

    Usage:
        extractor = ImageContentExtractor()
        result = await extractor.extract(image_bytes)
    """

    def __init__(self):
        self.vision_model: str = settings.LLAMA_VISION_MODEL
        self.api_key: Optional[str] = settings.OPENROUTER_API_KEY
        self.base_url: str = settings.OPENROUTER_BASE_URL

        print(f"[EXTRACTOR] Content extractor initialized", flush=True)
        print(f"[EXTRACTOR]   OCR: {'available' if TESSERACT_AVAILABLE else 'unavailable'}", flush=True)
        print(f"[EXTRACTOR]   Vision model: {self.vision_model}", flush=True)

    async def extract(self, image_bytes: bytes) -> ContentExtractionResult:
        """
        Extract content from an image, trying OCR first then Vision.

        Args:
            image_bytes: Raw bytes of the uploaded image.

        Returns:
            ContentExtractionResult with extracted text and method used.
        """
        # ─── Step A: Try OCR first ─────────────────────
        if TESSERACT_AVAILABLE:
            try:
                ocr_text = await self._extract_ocr(image_bytes)
                if ocr_text and len(ocr_text.strip()) > 10:
                    print(f"[EXTRACTOR] OCR extracted {len(ocr_text)} chars", flush=True)
                    return ContentExtractionResult(
                        method="ocr",
                        extracted_text=ocr_text.strip(),
                        success=True,
                    )
                else:
                    print("[EXTRACTOR] OCR found no meaningful text — falling back to Vision", flush=True)
            except Exception as e:
                print(f"[EXTRACTOR] OCR failed: {type(e).__name__}: {e}", flush=True)

        # ─── Step B: Vision model fallback ─────────────
        try:
            vision_text = await self._extract_vision(image_bytes)
            if vision_text:
                print(f"[EXTRACTOR] Vision model described image ({len(vision_text)} chars)", flush=True)
                return ContentExtractionResult(
                    method="vision",
                    extracted_text=vision_text.strip(),
                    success=True,
                )
        except Exception as e:
            print(f"[EXTRACTOR] Vision model failed: {type(e).__name__}: {e}", flush=True)
            traceback.print_exc()

        # ─── Both failed ──────────────────────────────
        return ContentExtractionResult(
            method="none",
            extracted_text="",
            success=False,
        )

    async def _extract_ocr(self, image_bytes: bytes) -> str:
        """
        Run OCR on image bytes using pytesseract.
        Wrapped in asyncio.to_thread() to avoid blocking the event loop.
        """

        def _sync_ocr() -> str:
            img = Image.open(io.BytesIO(image_bytes))
            # Convert to RGB if needed (e.g., RGBA PNGs)
            if img.mode != "RGB":
                img = img.convert("RGB")
            return pytesseract.image_to_string(img)

        return await asyncio.to_thread(_sync_ocr)

    async def _extract_vision(self, image_bytes: bytes) -> str:
        """
        Send the image to LLaMA 4 Scout vision model via OpenRouter.
        Uses the exact payload structure specified in the requirements.
        """
        if not self.api_key:
            raise RuntimeError("OPENROUTER_API_KEY not set — cannot use vision model")

        # Encode image as base64 data URI
        b64_image = base64.b64encode(image_bytes).decode("utf-8")
        data_uri = f"data:image/jpeg;base64,{b64_image}"

        # Exact payload structure from the requirements
        payload = {
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "What's in this image?",
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": data_uri,
                            },
                        },
                    ],
                }
            ],
            "model": self.vision_model,
            "temperature": 1,
            "max_completion_tokens": 1024,
            "top_p": 1,
            "stream": False,
            "stop": None,
        }

        # Build OpenRouter headers
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        if settings.OPENROUTER_SITE_URL:
            headers["HTTP-Referer"] = settings.OPENROUTER_SITE_URL
        if settings.OPENROUTER_SITE_NAME:
            headers["X-OpenRouter-Title"] = settings.OPENROUTER_SITE_NAME

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            data = response.json()

        # Extract the text response
        choices = data.get("choices", [])
        if choices:
            message = choices[0].get("message", {})
            content = message.get("content", "")
            return content

        return ""


# ═══════════════════════════════════════════════════════
# 3. CUSTOM REALITY CHECK — AUDITOR-7 Integration
# ═══════════════════════════════════════════════════════

# Specialized image verification prompt for AUDITOR-7
IMAGE_REALITY_SYSTEM_PROMPT = """You are AUDITOR-7, a senior forensic image verification investigator.

You are given EXTRACTED CONTENT from an image (either text found via OCR, or a scene description from a vision model).

Your job: Determine if the image's content is MISLEADING, FABRICATED, or LEGITIMATE by analyzing the extracted content against known facts.

You must respond ONLY with a valid JSON object. No markdown fences, no explanations outside the JSON."""

IMAGE_REALITY_PROMPT = """IMAGE REALITY VERIFICATION CASE FILE
══════════════════════════════════════

▸ EXTRACTION METHOD: {extraction_method}

▸ EXTRACTED CONTENT FROM IMAGE:
{extracted_content}

══════════════════════════════════════

INSTRUCTIONS:
Analyze whether the extracted content from this image is factually accurate,
misleading, or fabricated based on your analysis of the content.

Consider:
- Is the text or visual content factually accurate and verifiable?
- Are there logical impossibilities, fabricated details, or misleading claims?
- Could the image be a screenshot of fake news, a manipulated headline, or satire?
- Does the content contain known misinformation or debunked claims?

Return your verdict as a **valid JSON object** with exactly these keys:

{{
  "isFraud": <boolean — true if misleading/fabricated/misinformation; false if legitimate or unverifiable>,
  "riskScore": <integer 0–100 — 0=trustworthy, 100=completely fabricated>,
  "confidenceLevel": "<one of: Low, Medium, High, Critical>",
  "flags": ["<list of specific red flags or fabrication indicators found>"],
  "analysisSummary": "<A detailed 3–5 sentence forensic analysis. Reference the extracted content and your assessment of authenticity.>"
}}

SCORING GUIDELINES:
- 0–25: Content is factual and verifiable
- 26–50: Minor inaccuracies or claims that cannot be fully verified
- 51–75: Significant misleading content or fabrication indicators
- 76–100: Fabricated, deliberately deceptive, or contradicts known facts

Return ONLY the JSON object."""


async def run_custom_reality_check(
    extracted_content: str,
    extraction_method: str = "unknown",
) -> ImageAnalysisResult:
    """
    Run the custom reality check on extracted image content using AUDITOR-7.

    This function takes the content extracted from an image (either OCR text
    or a Vision model description) and sends it to the OpenRouter LLM for
    forensic analysis.

    Args:
        extracted_content: Text extracted from the image.
        extraction_method: How the content was extracted ('ocr' or 'vision').

    Returns:
        ImageAnalysisResult with the full verdict.
    """
    from openai import AsyncOpenAI

    api_key = settings.OPENROUTER_API_KEY
    if not api_key:
        return ImageAnalysisResult(
            verdict=ImageVerdict.UNVERIFIABLE,
            isFraud=False,
            riskScore=50,
            confidenceLevel=ImageConfidenceLevel.LOW,
            flags=["OpenRouter API key not configured"],
            analysisSummary="Cannot perform reality check — no API key configured.",
            extractionMethod=extraction_method,
            extractedContent=extracted_content[:500],
        )

    # Build prompt
    prompt = IMAGE_REALITY_PROMPT.format(
        extraction_method=extraction_method.upper(),
        extracted_content=extracted_content[:3000],  # Truncate to avoid token overflow
    )

    try:
        # Build OpenRouter-specific headers
        extra_headers = {}
        if settings.OPENROUTER_SITE_URL:
            extra_headers["HTTP-Referer"] = settings.OPENROUTER_SITE_URL
        if settings.OPENROUTER_SITE_NAME:
            extra_headers["X-OpenRouter-Title"] = settings.OPENROUTER_SITE_NAME

        client = AsyncOpenAI(
            api_key=api_key,
            base_url=settings.OPENROUTER_BASE_URL,
            default_headers=extra_headers if extra_headers else None,
        )

        print("\n[REALITY CHECK] ─── AUDITOR-7 STREAMING ───", flush=True)

        completion = await client.chat.completions.create(
            model=settings.OPENROUTER_MODEL_NAME,
            messages=[
                {"role": "system", "content": IMAGE_REALITY_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=settings.OPENROUTER_TEMPERATURE,
            max_tokens=1024,
            top_p=0.95,
            stream=True,
        )

        # Assemble streamed chunks
        collected: list[str] = []
        async for chunk in completion:
            delta = chunk.choices[0].delta.content or ""
            collected.append(delta)
            sys.stdout.write(delta)
            sys.stdout.flush()

        print("\n[REALITY CHECK] ─── END STREAM ─────────────\n", flush=True)

        raw_text = "".join(collected).strip()

        # Parse the JSON response
        parsed = _parse_json_response(raw_text)

        is_fraud = parsed.get("isFraud", False)
        risk_score = max(0, min(100, int(parsed.get("riskScore", 50))))

        # Determine verdict
        if is_fraud and risk_score >= 50:
            verdict = ImageVerdict.MISLEADING
        elif is_fraud:
            verdict = ImageVerdict.UNVERIFIABLE
        else:
            verdict = ImageVerdict.VERIFIED_REAL

        confidence_str = parsed.get("confidenceLevel", "Medium").lower().strip()
        confidence_map = {
            "low": ImageConfidenceLevel.LOW,
            "medium": ImageConfidenceLevel.MEDIUM,
            "high": ImageConfidenceLevel.HIGH,
            "critical": ImageConfidenceLevel.CRITICAL,
        }

        return ImageAnalysisResult(
            verdict=verdict,
            isFraud=is_fraud,
            riskScore=risk_score,
            confidenceLevel=confidence_map.get(confidence_str, ImageConfidenceLevel.MEDIUM),
            flags=parsed.get("flags", []),
            analysisSummary=parsed.get(
                "analysisSummary",
                "Analysis completed but summary was not generated.",
            ),
            extractionMethod=extraction_method,
            extractedContent=extracted_content[:500],
        )

    except Exception as e:
        print(f"[REALITY CHECK] FAIL: {type(e).__name__}: {e}", flush=True)
        traceback.print_exc()

        return ImageAnalysisResult(
            verdict=ImageVerdict.UNVERIFIABLE,
            isFraud=False,
            riskScore=50,
            confidenceLevel=ImageConfidenceLevel.MEDIUM,
            flags=[f"Reality check error: {type(e).__name__}: {str(e)[:200]}"],
            analysisSummary=f"The reality check pipeline encountered an error: {str(e)}. Please try again.",
            extractionMethod=extraction_method,
            extractedContent=extracted_content[:500],
        )


# ─── JSON Response Parser ─────────────────────────

def _parse_json_response(raw_text: str) -> dict:
    """Parse LLM JSON response, handling markdown fences and extra text."""
    cleaned = raw_text

    # Strip markdown code fences
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Fallback: find first { ... } block
    match = re.search(r"\{[\s\S]*\}", cleaned)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    print(f"[REALITY CHECK] WARNING: Could not parse JSON. Raw: {raw_text[:500]}", flush=True)
    return {
        "isFraud": False,
        "riskScore": 50,
        "confidenceLevel": "Medium",
        "flags": ["Could not parse AI response"],
        "analysisSummary": raw_text[:1000],
    }