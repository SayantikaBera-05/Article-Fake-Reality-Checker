"""
Pydantic schemas for the Image Reality Checker pipeline.
Strict typing for the image analysis SSE events and final verdict.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

from app.schemas.detection import SourceReference, AuditTrail


class ImageVerdict(str, Enum):
    """High-level verdict category for image analysis."""

    VERIFIED_REAL = "VERIFIED_REAL"
    MISLEADING = "MISLEADING"
    UNVERIFIABLE = "UNVERIFIABLE"


class ImageConfidenceLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


# ─── Sightengine Result ───────────────────────────

class AIDetectionResult(BaseModel):
    """Result from the Sightengine AI-generation check."""

    is_ai_generated: bool = Field(
        ..., description="Whether the image was flagged as AI-generated"
    )
    ai_score: float = Field(
        ..., ge=0.0, le=1.0,
        description="AI generation confidence (0 = real, 1 = AI-generated)"
    )
    details: dict = Field(
        default_factory=dict,
        description="Raw Sightengine response details"
    )


# ─── Content Extraction Result ─────────────────────

class ContentExtractionResult(BaseModel):
    """Result from OCR or Vision model content extraction."""

    method: str = Field(
        ..., description="Extraction method used: 'ocr' or 'vision'"
    )
    extracted_text: str = Field(
        ..., description="The extracted text content from the image"
    )
    success: bool = Field(
        True, description="Whether extraction succeeded"
    )


# ─── Final Image Analysis Result ───────────────────

class ImageAnalysisResult(BaseModel):
    """Final verdict returned to the client after all pipeline stages."""

    verdict: ImageVerdict = Field(
        ..., description="High-level verdict category"
    )
    verificationStatus: str = Field(
        default="CONTRADICTED",
        description="Verification status: VERIFIED or CONTRADICTED"
    )
    isFraud: bool = Field(
        ..., description="Whether the image/content is misleading or fabricated"
    )
    riskScore: int = Field(
        ..., ge=0, le=100,
        description="Risk score from 0 (trustworthy) to 100 (fabricated)"
    )
    confidenceLevel: ImageConfidenceLevel = Field(
        ..., description="Confidence level of the analysis"
    )
    flags: List[str] = Field(
        default_factory=list,
        description="List of specific indicators found"
    )
    analysisSummary: str = Field(
        ..., description="Human-readable summary of the analysis"
    )
    extractionMethod: Optional[str] = Field(
        None, description="How content was extracted: 'ocr', 'vision', or None"
    )
    extractedContent: Optional[str] = Field(
        None, description="The content extracted from the image (if any)"
    )
    evidenceTimeline: List[str] = Field(
        default_factory=list,
        description="Bulleted evidence list with source citations"
    )
    sources: List[SourceReference] = Field(
        default_factory=list,
        description="Web sources consulted during the RAG analysis pipeline"
    )
    auditTrail: Optional[AuditTrail] = Field(
        default=None,
        description="Tool execution log: Serper query, Jina URLs, OpenRouter model"
    )


    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "verdict": "MISLEADING",
                    "verificationStatus": "CONTRADICTED",
                    "isFraud": True,
                    "riskScore": 78,
                    "confidenceLevel": "High",
                    "flags": ["Date mismatch", "Manipulated text overlay"],
                    "analysisSummary": "The image contains text claiming...",
                    "extractionMethod": "ocr",
                    "extractedContent": "Breaking: ...",
                    "evidenceTimeline": [
                        "[Reuters](https://reuters.com/...) - Confirms this claim is false"
                    ],
                    "sources": [
                        {
                            "title": "Reuters Fact Check",
                            "url": "https://reuters.com/fact-check/...",
                            "snippet": "This claim has been debunked...",
                        }
                    ],
                }
            ]
        }
    }

