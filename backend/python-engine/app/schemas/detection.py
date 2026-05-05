"""
Pydantic schemas for request/response validation.
Strict typing for the fraud detection API contract.
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
    """Schema for incoming fraud detection payloads from the Node gateway."""

    transactionAmount: float = Field(..., gt=0, description="Transaction amount in currency units")
    transactionType: Optional[str] = Field(None, description="Type of transaction (e.g., purchase, transfer)")
    merchantName: Optional[str] = Field(None, description="Name of the merchant")
    merchantCategory: Optional[str] = Field(None, description="Merchant category code or name")
    cardType: Optional[str] = Field(None, description="Card type (e.g., credit, debit, virtual)")
    location: Optional[str] = Field(None, description="Transaction location")
    ipAddress: Optional[str] = Field(None, description="IP address of the requester")
    deviceId: Optional[str] = Field(None, description="Device fingerprint or identifier")
    description: Optional[str] = Field(None, max_length=5000, description="Additional context or document text")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Arbitrary additional metadata")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "transactionAmount": 15000.00,
                    "transactionType": "wire_transfer",
                    "merchantName": "Unknown Offshore LLC",
                    "merchantCategory": "financial_services",
                    "cardType": "credit",
                    "location": "Lagos, Nigeria",
                    "ipAddress": "192.168.1.100",
                    "deviceId": "device_abc123",
                    "description": "Large international wire transfer to unverified account",
                }
            ]
        }
    }


# ─── Response Schema ───────────────────────────────
class FraudDetectionResponse(BaseModel):
    """Strict response schema returned to the Node gateway."""

    isFraud: bool = Field(..., description="Whether the transaction is flagged as fraudulent")
    riskScore: int = Field(..., ge=0, le=100, description="Risk score from 0 (safe) to 100 (critical)")
    confidenceLevel: ConfidenceLevel = Field(..., description="Confidence level of the analysis")
    flags: List[str] = Field(default_factory=list, description="List of specific fraud indicators found")
    analysisSummary: str = Field(..., description="Human-readable summary of the analysis")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "isFraud": True,
                    "riskScore": 92,
                    "confidenceLevel": "High",
                    "flags": ["Suspicious IP location", "Unusual transaction volume"],
                    "analysisSummary": "The transaction exhibits patterns strongly correlated with known fraudulent behavior...",
                }
            ]
        }
    }
