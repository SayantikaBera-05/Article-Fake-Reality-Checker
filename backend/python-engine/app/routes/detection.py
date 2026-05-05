"""
Detection route — POST /detect
Receives transaction data, runs fraud analysis, returns risk assessment.
"""

from fastapi import APIRouter, Request
from app.schemas.detection import FraudDetectionRequest, FraudDetectionResponse

router = APIRouter()


@router.post(
    "/detect",
    response_model=FraudDetectionResponse,
    summary="Analyze a transaction for fraud",
    description="Accepts transaction details and returns a comprehensive fraud risk assessment.",
)
async def detect_fraud(
    payload: FraudDetectionRequest,
    request: Request,
) -> FraudDetectionResponse:
    """
    Core detection endpoint.
    Delegates to the FraudDetector service loaded at app startup.
    """
    detector = request.app.state.detector
    result = await detector.analyze(payload)
    return result
