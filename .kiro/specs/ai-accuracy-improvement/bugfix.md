# Bugfix Requirements Document

## Introduction

The Article Fake Reality Checker system uses a 3-phase verification pipeline (Search → Content Extraction → Cross-Examination) to verify factual claims. The AI verification agent (AUDITOR-7) in Phase 3 currently achieves only 70% accuracy (7 out of 10 correct classifications) when tested against a ground truth dataset of 10 mixed claims (5 factual, 5 fabricated). This means 3 out of 10 claims are being incorrectly classified as either VERIFIED when they should be CONTRADICTED, or vice versa.

The system uses OpenRouter API with configurable models (default: "openrouter/free"), temperature 0.3, and strict prompts that instruct the agent to use ONLY external evidence with no reliance on internal knowledge. The binary verdict system (VERIFIED or CONTRADICTED) forces a definitive classification for every claim.

The target accuracy is >90% (9+ out of 10 correct) to ensure reliable fact-checking for end users.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the AI evaluates claims against external evidence THEN the system achieves only 70% accuracy (7/10 correct classifications)

1.2 WHEN the AI encounters ambiguous or partially-supported claims THEN the system incorrectly classifies 3 out of 10 claims due to prompt engineering issues, model limitations, or scoring guideline misalignment

1.3 WHEN the AI applies the binary VERIFIED/CONTRADICTED classification THEN the system may force incorrect verdicts on nuanced claims that don't fit cleanly into either category

1.4 WHEN the AI uses the current AUDITOR_SYSTEM_PROMPT and INVESTIGATION_PROMPT THEN the system produces inconsistent or incorrect verdicts due to unclear instructions, inadequate scoring guidelines, or insufficient emphasis on evidence quality assessment

1.5 WHEN the AI operates with temperature 0.3 and the default "openrouter/free" model THEN the system may lack sufficient reasoning capability or consistency to achieve >90% accuracy

### Expected Behavior (Correct)

2.1 WHEN the AI evaluates claims against external evidence THEN the system SHALL achieve >90% accuracy (9+ out of 10 correct classifications)

2.2 WHEN the AI encounters ambiguous or partially-supported claims THEN the system SHALL correctly classify them by applying clear, well-defined criteria for VERIFIED vs CONTRADICTED verdicts

2.3 WHEN the AI applies the binary VERIFIED/CONTRADICTED classification THEN the system SHALL produce correct verdicts by using improved prompt engineering that clarifies edge cases and provides explicit guidance for nuanced claims

2.4 WHEN the AI uses improved prompts (AUDITOR_SYSTEM_PROMPT and INVESTIGATION_PROMPT) THEN the system SHALL produce consistent and correct verdicts through clearer instructions, better-aligned scoring guidelines, and explicit emphasis on evidence quality, recency, and credibility assessment

2.5 WHEN the AI operates with optimized configuration (temperature, model selection, max tokens) THEN the system SHALL achieve >90% accuracy through improved reasoning capability and consistency

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the AI evaluates claims with clear, unambiguous evidence THEN the system SHALL CONTINUE TO correctly classify them as VERIFIED or CONTRADICTED

3.2 WHEN the AI uses the 3-phase verification pipeline (Search → Content Extraction → Cross-Examination) THEN the system SHALL CONTINUE TO follow the same pipeline architecture without changes to Phase 1 or Phase 2

3.3 WHEN the AI operates with the external-evidence-only approach THEN the system SHALL CONTINUE TO use ONLY external evidence and NOT rely on internal/pre-trained knowledge

3.4 WHEN the AI returns a verdict THEN the system SHALL CONTINUE TO return a structured FraudDetectionResponse with verificationStatus, isFraud, riskScore, confidenceLevel, flags, analysisSummary, evidenceTimeline, auditTrail, and sources

3.5 WHEN the AI encounters errors or API failures THEN the system SHALL CONTINUE TO return graceful error responses with structured error messages and fallback verdicts

3.6 WHEN the AI processes claims through the OpenRouter API THEN the system SHALL CONTINUE TO use async streaming for real-time visibility and non-blocking execution
