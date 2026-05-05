"""
Fraud Detection Service — Core Analysis Engine

This module contains the fraud detection logic. It uses a rule-based + heuristic
scoring system as the default implementation. Replace the `analyze` method internals
with a trained Scikit-Learn model, or an external AI API call (e.g., Gemini/OpenAI)
for production use.
"""

import re
from typing import List, Tuple
from app.schemas.detection import (
    FraudDetectionRequest,
    FraudDetectionResponse,
    ConfidenceLevel,
)


# ─── Known Risk Indicators ──────────────────────────
HIGH_RISK_LOCATIONS = [
    "lagos", "kiev", "pyongyang", "minsk", "caracas",
    "offshore", "unknown", "vpn", "tor",
]

HIGH_RISK_CATEGORIES = [
    "gambling", "cryptocurrency", "adult_entertainment",
    "money_transfer", "prepaid_cards", "wire_services",
]

SUSPICIOUS_KEYWORDS = [
    "urgent", "wire transfer", "offshore", "untraceable",
    "bitcoin", "anonymous", "western union", "moneygram",
    "prepaid", "gift card", "no questions",
]


class FraudDetector:
    """
    Rule-based fraud detection engine with heuristic scoring.

    Production Note:
    ─────────────────
    Replace the body of `analyze()` with:
      • A Scikit-Learn pipeline loaded via joblib
      • A Pandas feature-engineering step
      • Or an external AI API call (Gemini / OpenAI) for NLP-based anomaly detection
    """

    def __init__(self):
        """Initialize detector. Load ML model here if using one."""
        # Example: self.model = joblib.load("models/fraud_model.pkl")
        self._amount_thresholds = {
            "low": 500,
            "medium": 5000,
            "high": 15000,
            "critical": 50000,
        }

    async def analyze(self, payload: FraudDetectionRequest) -> FraudDetectionResponse:
        """
        Analyze the incoming transaction data and return a risk assessment.

        Scoring breakdown:
        ─ Amount analysis:       0-30 points
        ─ Location analysis:     0-20 points
        ─ Category analysis:     0-15 points
        ─ Behavioral signals:    0-20 points
        ─ Text/NLP analysis:     0-15 points
        ─────────────────────────────────
        Total possible:          100 points
        """
        score = 0
        flags: List[str] = []

        # ─── 1. Transaction Amount Analysis ──────────
        amount_score, amount_flags = self._analyze_amount(payload.transactionAmount)
        score += amount_score
        flags.extend(amount_flags)

        # ─── 2. Location Analysis ────────────────────
        location_score, location_flags = self._analyze_location(payload.location)
        score += location_score
        flags.extend(location_flags)

        # ─── 3. Merchant Category Analysis ───────────
        category_score, category_flags = self._analyze_category(
            payload.merchantCategory, payload.merchantName
        )
        score += category_score
        flags.extend(category_flags)

        # ─── 4. Behavioral Signals ───────────────────
        behavior_score, behavior_flags = self._analyze_behavior(payload)
        score += behavior_score
        flags.extend(behavior_flags)

        # ─── 5. Text / NLP Analysis ──────────────────
        text_score, text_flags = self._analyze_text(payload.description)
        score += text_score
        flags.extend(text_flags)

        # ─── Clamp score ─────────────────────────────
        risk_score = min(max(score, 0), 100)

        # ─── Determine fraud status & confidence ────
        is_fraud = risk_score >= 60
        confidence = self._get_confidence_level(risk_score)

        # ─── Generate summary ────────────────────────
        summary = self._generate_summary(
            is_fraud, risk_score, confidence, flags, payload
        )

        return FraudDetectionResponse(
            isFraud=is_fraud,
            riskScore=risk_score,
            confidenceLevel=confidence,
            flags=flags,
            analysisSummary=summary,
        )

    # ─── Sub-Analyzers ──────────────────────────────

    def _analyze_amount(self, amount: float) -> Tuple[int, List[str]]:
        score = 0
        flags = []

        if amount > self._amount_thresholds["critical"]:
            score += 30
            flags.append(f"Extremely high transaction amount (${amount:,.2f})")
        elif amount > self._amount_thresholds["high"]:
            score += 22
            flags.append(f"Very high transaction amount (${amount:,.2f})")
        elif amount > self._amount_thresholds["medium"]:
            score += 14
            flags.append(f"High transaction amount (${amount:,.2f})")
        elif amount > self._amount_thresholds["low"]:
            score += 6

        # Suspicious round numbers (often seen in fraud)
        if amount > 1000 and amount == int(amount):
            score += 5
            flags.append("Suspiciously round transaction amount")

        return score, flags

    def _analyze_location(self, location: str | None) -> Tuple[int, List[str]]:
        if not location:
            return 5, ["No location data provided"]

        score = 0
        flags = []
        loc_lower = location.lower()

        for risk_loc in HIGH_RISK_LOCATIONS:
            if risk_loc in loc_lower:
                score += 20
                flags.append(f"High-risk geographic location: {location}")
                break

        return score, flags

    def _analyze_category(
        self, category: str | None, merchant_name: str | None
    ) -> Tuple[int, List[str]]:
        score = 0
        flags = []

        if category:
            cat_lower = category.lower()
            for risk_cat in HIGH_RISK_CATEGORIES:
                if risk_cat in cat_lower:
                    score += 15
                    flags.append(f"High-risk merchant category: {category}")
                    break

        if merchant_name:
            name_lower = merchant_name.lower()
            if any(kw in name_lower for kw in ["unknown", "anonymous", "temp", "test"]):
                score += 10
                flags.append(f"Suspicious merchant name: {merchant_name}")

        return score, flags

    def _analyze_behavior(self, payload: FraudDetectionRequest) -> Tuple[int, List[str]]:
        score = 0
        flags = []

        # Missing device fingerprint
        if not payload.deviceId:
            score += 8
            flags.append("No device fingerprint provided")

        # IP analysis (basic heuristics)
        if payload.ipAddress:
            ip = payload.ipAddress
            if ip.startswith(("10.", "192.168.", "172.")):
                score += 5
                flags.append("Transaction from private/internal IP range")
            if ip == "0.0.0.0" or ip == "127.0.0.1":
                score += 12
                flags.append("Suspicious localhost/null IP address")

        # Card type risk
        if payload.cardType and payload.cardType.lower() in ["prepaid", "virtual", "gift"]:
            score += 8
            flags.append(f"High-risk card type: {payload.cardType}")

        # Transaction type risk
        if payload.transactionType and payload.transactionType.lower() in [
            "wire_transfer", "crypto_purchase", "international_transfer"
        ]:
            score += 7
            flags.append(f"High-risk transaction type: {payload.transactionType}")

        return score, flags

    def _analyze_text(self, description: str | None) -> Tuple[int, List[str]]:
        if not description:
            return 0, []

        score = 0
        flags = []
        desc_lower = description.lower()

        matches = [kw for kw in SUSPICIOUS_KEYWORDS if kw in desc_lower]
        if matches:
            score += min(len(matches) * 5, 15)
            flags.append(f"Suspicious keywords detected: {', '.join(matches)}")

        # Excessive urgency patterns
        urgency_patterns = r"\b(asap|immediately|right now|hurry|rush)\b"
        if re.search(urgency_patterns, desc_lower):
            score += 5
            flags.append("Urgency language detected in description")

        return score, flags

    # ─── Helpers ─────────────────────────────────────

    def _get_confidence_level(self, score: int) -> ConfidenceLevel:
        if score >= 85:
            return ConfidenceLevel.CRITICAL
        elif score >= 60:
            return ConfidenceLevel.HIGH
        elif score >= 35:
            return ConfidenceLevel.MEDIUM
        else:
            return ConfidenceLevel.LOW

    def _generate_summary(
        self,
        is_fraud: bool,
        risk_score: int,
        confidence: ConfidenceLevel,
        flags: List[str],
        payload: FraudDetectionRequest,
    ) -> str:
        if not is_fraud:
            return (
                f"The transaction of ${payload.transactionAmount:,.2f} has been analyzed "
                f"and assigned a risk score of {risk_score}/100 ({confidence.value} confidence). "
                f"No significant fraud indicators were detected. "
                f"The transaction appears to be legitimate based on the available data."
            )

        flag_summary = "; ".join(flags[:5]) if flags else "general anomaly patterns"
        return (
            f"⚠️ FRAUD ALERT: The transaction of ${payload.transactionAmount:,.2f} has been flagged "
            f"with a risk score of {risk_score}/100 ({confidence.value} confidence). "
            f"Key indicators: {flag_summary}. "
            f"This transaction exhibits patterns strongly correlated with known fraudulent behavior "
            f"and is recommended for manual review or automatic blocking."
        )
