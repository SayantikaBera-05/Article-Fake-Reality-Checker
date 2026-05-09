"""
Pydantic schemas for request/response validation.
Strict typing for the article verification API contract.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from enum import Enum


class ConfidenceLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


# ─── Request Schema ────────────────────────────────
class FraudDetectionRequest(BaseModel):
    """
    Schema for incoming verification payloads from the Node gateway.

    The gateway sends article/claim text in the `description` field.
    Other fields (transactionAmount, transactionType, etc.) are kept
    for backward-compatibility with the existing frontend contract
    but are NOT used by the Gemini analysis engine.
    """

    transactionAmount: float = Field(
        default=1.0, gt=0,
        description="Legacy field — kept for contract compatibility"
    )
    transactionType: Optional[str] = Field(
        None,
        description="Verification type: text_verification | url_verification"
    )
    merchantName: Optional[str] = Field(
        None,
        description="Hostname when verifying URLs"
    )
    merchantCategory: Optional[str] = Field(None)
    cardType: Optional[str] = Field(None)
    location: Optional[str] = Field(None)
    ipAddress: Optional[str] = Field(None)
    deviceId: Optional[str] = Field(None)
    description: Optional[str] = Field(
        None, max_length=50000,
        description="The article text or claim to verify (primary input)"
    )
    metadata: Optional[Dict[str, Any]] = Field(None)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "transactionAmount": 1,
                    "transactionType": "text_verification",
                    "description": "Scientists have confirmed that the Earth is flat according to a new NASA study published today.",
                }
            ]
        }
    }


# ─── Source Reference ──────────────────────────────
class SourceReference(BaseModel):
    """A web source consulted during the RAG analysis pipeline."""

    title: str = Field(..., description="Title of the source page")
    url: str = Field(..., description="URL of the source")
    snippet: str = Field("", description="Brief snippet from the search result")


# ─── Response Schema ───────────────────────────────
class FraudDetectionResponse(BaseModel):
    """Strict response schema returned to the Node gateway."""

    isFraud: bool = Field(
        ...,
        description="Whether the content is flagged as misleading/false"
    )
    riskScore: int = Field(
        ..., ge=0, le=100,
        description="Risk score from 0 (trustworthy) to 100 (fabricated)"
    )
    confidenceLevel: ConfidenceLevel = Field(
        ..., description="Confidence level of the analysis"
    )
    flags: List[str] = Field(
        default_factory=list,
        description="List of specific misinformation indicators found"
    )
    analysisSummary: str = Field(
        ..., description="Human-readable summary of the analysis"
    )
    sources: List[SourceReference] = Field(
        default_factory=list,
        description="Web sources consulted during the RAG analysis pipeline"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "isFraud": True,
                    "riskScore": 92,
                    "confidenceLevel": "High",
                    "flags": [
                        "No credible source cited",
                        "Contradicts established scientific consensus",
                    ],
                    "analysisSummary": "The claim that NASA confirmed the Earth is flat is fabricated...",
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
