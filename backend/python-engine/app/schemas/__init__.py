"""
Schemas package — Pydantic request/response models.

Contains all data validation schemas:
    - detection: FraudDetectionRequest, FraudDetectionResponse, SourceReference, AuditTrail
    - image_detection: ImageAnalysisResult, ImageVerdict, AIDetectionResult
"""

from app.schemas.detection import (
    FraudDetectionRequest,
    FraudDetectionResponse,
    ConfidenceLevel,
    SourceReference,
    AuditTrail,
)
from app.schemas.image_detection import (
    ImageAnalysisResult,
    ImageVerdict,
    ImageConfidenceLevel,
    AIDetectionResult,
    ContentExtractionResult,
)

__all__ = [
    "FraudDetectionRequest",
    "FraudDetectionResponse",
    "ConfidenceLevel",
    "SourceReference",
    "AuditTrail",
    "ImageAnalysisResult",
    "ImageVerdict",
    "ImageConfidenceLevel",
    "AIDetectionResult",
    "ContentExtractionResult",
]
