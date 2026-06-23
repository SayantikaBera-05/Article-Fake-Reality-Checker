"""
SSE Load & Accuracy Tester
──────────────────────────────────────
Simulates concurrent users hitting the SSE streaming endpoint
to verify the pipeline handles parallel requests gracefully,
and evaluates the accuracy of the Fraud Detection AI.

Usage:
  pip install httpx httpx-sse
  python load_checker.py
"""

import asyncio
import time
import json
import httpx
from httpx_sse import aconnect_sse

# ─── Configuration ──────────────────────────────────

# Toggle target: "python" hits the engine directly, "gateway" goes through Node
TARGET = "python"

PYTHON_ENGINE_URL = "http://localhost:8000/detect/stream"
GATEWAY_URL = "http://localhost:5000/api/fraud/check/stream"

# Number of concurrent users to simulate (matches the number of test claims)
CONCURRENT_USERS = 10

# 20 Mixed Claims structured with their Ground Truth expected result.
# is_fraud = False (Factual), is_fraud = True (Fabricated)
TEST_CLAIMS = [
  {
    "text": "India Launches Chandrayaan-4 Mission to Moon's South Pole",
    "verification": "1. **Verified?** No  \n2. **Confirming outlets?** None. Reputable space news sources (e.g., ISRO official statements, BBC, SpaceNews) have not reported a launch of Chandrayaan-4 as of May 2025. The only Indian lunar missions launched to date are Chandrayaan-1 (2008), Chandrayaan-2 (2019), and Chandrayaan-3 (2023).  \n3. **Any contradictions?** ISRO has publicly stated that Chandrayaan-4 is a planned sample-return mission, but it has not been launched and is still in development. No credible launch event has occurred.  \n4. **Confidence:** High",
    "is_fraud": True
  },
  {
    "text": "Supreme Court Delivers Final Verdict on Ayodhya Land Dispute Appeals",
    "verification": "1. **Verified?** Yes  \n2. **Confirming outlets:** Major news organizations such as BBC, CNN, The Hindu, Times of India, Reuters, and others reported on the Supreme Court of India delivering its final verdict on the Ayodhya land dispute on November 9, 2019.  \n3. **Any contradictions?** None. The headline accurately reflects the historical judgment.  \n4. **Confidence:** High",
    "is_fraud": False
  },
  {
    "text": "Heatwave Claims Over 200 Lives in Northern India",
    "verification": "1. **Verified?** Partial  \n2. **Confirming outlets?** BBC, Reuters, The Guardian, Al Jazeera, Times of India reported \"over 200 deaths\" in northern India during the June 2024 heatwave.  \n3. **Any contradictions?** Yes. Indian state government figures (e.g., Uttar Pradesh, Bihar) initially reported lower official counts (around 100–150 heatstroke deaths), leading to discrepancies between media tallies and official records.  \n4. **Confidence:** High – multiple credible international and Indian news outlets converged on the \"over 200\" figure, though official numbers varied.",
    "is_fraud": True
  },
  {
    "text": "Indian Economy Grows at 8.1% in Q4 of Fiscal Year 2025-26",
    "verification": "1. **Verified?** No  \n2. **Confirming outlets?** None. No credible source has reported actual GDP data for Q4 of FY 2025-26, as that period (January–March 2026) has not yet occurred.  \n3. **Any contradictions?** Yes. The most recent available data (Q4 of FY 2024-25, released in May 2025) showed growth of approximately 6.5%, not 8.1%. Projections for FY 2025-26 are preliminary and do not specify an 8.1% quarterly figure.  \n4. **Confidence:** High — the headline refers to a future quarter that cannot yet have official data.",
    "is_fraud": True
  },
  {
    "text": "Parliament Passes Landmark Digital Personal Data Protection Bill",
    "verification": "1. **Verified?** Yes  \n2. **Confirming outlets:** Reuters, BBC News, The Hindu, Times of India, and other major Indian and international news organizations reported on the passage of the Digital Personal Data Protection Bill in August 2023.  \n3. **Any contradictions?** None. The bill was passed by both houses of the Indian Parliament (Lok Sabha on 7 August 2023, Rajya Sabha on 9 August 2023) and later received presidential assent, becoming an act.  \n4. **Confidence:** High",
    "is_fraud": False
  },
  {
    "text": "India Wins ICC Cricket World Cup 2026",
    "verification": "1. **Verified?** No  \n2. **Confirming outlets?** None; no credible source has reported this.  \n3. **Any contradictions?** The next ICC Men’s Cricket World Cup (ODI) is scheduled for 2027, not 2026. The ICC Men’s T20 World Cup is in 2026, but that tournament has not yet taken place (scheduled for June 2026), so no winner exists.  \n4. **Confidence:** High",
    "is_fraud": True
  },
  {
    "text": "Major Floods in Assam Displace Over 1 Million People",
    "verification": "1. **Verified?** Yes  \n2. **Confirming outlets:** Reuters, BBC, NDTV, The Hindu, Al Jazeera (all reported in recent years, notably during the 2024 monsoon season, that floods in Assam displaced over 1 million people)  \n3. **Any contradictions?** No major contradictions; some regional variations in exact counts exist, but the “over 1 million” figure is consistently cited by government and media sources.  \n4. **Confidence:** High",
    "is_fraud": False
  },
  {
    "text": "India and China Agree on Border Disengagement in Eastern Ladakh",
    "verification": "1. **Verified?** Yes  \n2. **Confirming outlets?** Reuters, BBC, The Hindu, The Times of India, Al Jazeera, Associated Press, and other major international and Indian media outlets reported this agreement in late October 2024.  \n3. **Any contradictions?** No credible contradictions. The agreement was formally announced by both India’s Ministry of External Affairs and China’s Foreign Ministry after rounds of diplomatic and military talks.  \n4. **Confidence:** High",
    "is_fraud": False
  },
  {
    "text": "Government Announces Universal Basic Income Pilot in Five Districts",
    "verification": "1. **Verified?** No  \n2. **Confirming outlets?** None – no specific government, country, or date is provided, and no credible news sources are currently reporting a universal basic income pilot explicitly covering “five districts” as a generic headline.  \n3. **Any contradictions?** The claim is too vague to contradict directly, but it does not match any known, recent UBI pilot announcements (e.g., in Kenya, Finland, or the US) that specify a precise number of districts without additional context.  \n4. **Confidence:** Low – without a named government, timeframe, or sourcing, the headline cannot be confirmed as factual.",
    "is_fraud": True
  },
  {
    "text": "ISRO Successfully Tests Reusable Launch Vehicle at Sriharikota",
    "verification": "1. **Verified?** Partial  \n2. **Confirming outlets?** Yes, the *Hindu*, *Times of India*, and *NDTV* reported ISRO's RLV-TD (Reusable Launch Vehicle – Technology Demonstrator) test from Sriharikota on May 23, 2016. However, no recent test at Sriharikota matches the headline; the 2023 and 2024 RLV landing experiments were conducted at Chitradurga, not Sriharikota.  \n3. **Any contradictions?** The headline is factually correct for the historic 2016 test, but if interpreted as a current event, it contradicts the location of recent ISRO RLV tests (which occurred at Chitradurga). No contradictions arise for the 2016 event.  \n4. **Confidence:** Medium – The statement is accurate only for a specific past event, not for any recent test.",
    "is_fraud": False
  }
]

EXPECTED_STAGES_COUNT = 4

# ─── Simulated User ────────────────────────────────

async def simulate_user(user_id: int, url: str):
    """Simulate a single user consuming the SSE stream."""
    # Assign a specific claim based on user_id to ensure we test all 20
    claim_index = (user_id - 1) % len(TEST_CLAIMS)
    claim_data = TEST_CLAIMS[claim_index]
    
    payload = {
        "transactionAmount": 1,
        "description": claim_data["text"],
        "transactionType": "text_verification",
        "guestSessionId": f"load-test-user-{user_id}",
    }
    
    start_time = time.time()
    stages_received = []
    result_received = False
    error_received = None
    actual_fraud_result = None

    print(f"[User {user_id:>2}] ⏳ Connecting... | Claim: \"{payload['description'][:40]}...\"")

    async with httpx.AsyncClient(timeout=httpx.Timeout(180.0)) as client:
        try:
            async with aconnect_sse(
                client, "POST", url,
                json=payload,
                headers={"Content-Type": "application/json"},
            ) as event_source:
                async for event in event_source.aiter_sse():
                    elapsed = round(time.time() - start_time, 2)

                    if event.event == "stage":
                        data = json.loads(event.data)
                        stage = data.get("stage", "?")
                        text = data.get("text", "")
                        stages_received.append(stage)
                        print(f"[User {user_id:>2}] 🔄 {elapsed:>6}s | Stage: {stage} — {text}")

                    elif event.event == "completed":
                        result_received = True
                        data = json.loads(event.data)
                        result = data.get("result", {})
                        
                        # Capture the actual fraud prediction from your AI engine
                        actual_fraud_result = result.get("isFraud", False)
                        risk = result.get("riskScore", "?")
                        
                        print(f"[User {user_id:>2}] ✅ {elapsed:>6}s | COMPLETED — Fraud: {actual_fraud_result}, Risk: {risk}/100")

                    elif event.event == "error":
                        data = json.loads(event.data)
                        error_received = data.get("message", "Unknown error")
                        print(f"[User {user_id:>2}] ❌ {elapsed:>6}s | ERROR: {error_received}")

        except Exception as e:
            elapsed = round(time.time() - start_time, 2)
            error_received = f"{type(e).__name__}: {e}"
            print(f"[User {user_id:>2}] 💀 {elapsed:>6}s | FAILED: {error_received}")

    total_time = round(time.time() - start_time, 2)

    return {
        "user_id": user_id,
        "total_time": total_time,
        "stages": stages_received,
        "completed": result_received,
        "error": error_received,
        "claim_text": claim_data["text"],
        "expected_fraud": claim_data["is_fraud"],
        "actual_fraud": actual_fraud_result
    }

# ─── Main ───────────────────────────────────────────

async def main():
    url = PYTHON_ENGINE_URL if TARGET == "python" else GATEWAY_URL

    print("=" * 80)
    print(f"  STARTING LOAD & ACCURACY TEST")
    print(f"  Concurrent Users: {CONCURRENT_USERS}")
    print("=" * 80)

    overall_start = time.time()
    tasks = [simulate_user(i, url) for i in range(1, CONCURRENT_USERS + 1)]
    results = await asyncio.gather(*tasks)
    overall_elapsed = round(time.time() - overall_start, 2)

    # ──────────────────────────────────────────────────
    # SECTION 1: SYSTEM SCALABILITY SCORE
    # ──────────────────────────────────────────────────
    print("\n" + "=" * 80)
    print("  SYSTEM SCALABILITY & PIPELINE REPORT")
    print("=" * 80)

    completed = [r for r in results if r["completed"]]
    times = [r["total_time"] for r in results]
    avg_time = sum(times) / len(times) if times else 0

    success_rate = len(completed) / len(results) if results else 0
    base_score = success_rate * 10.0
    latency_penalty = max(0, (avg_time - 5.0) * 0.2)
    scalability_score = max(0.0, min(10.0, round(base_score - latency_penalty, 1)))

    print(f"  Total Requests:  {len(results)}")
    print(f"  Completed:       {len(completed)} ✅")
    print(f"  Average Time:    {round(avg_time, 2)}s")
    print(f"  ⚙️ SCALABILITY SCORE: {scalability_score} / 10.0")

    # ──────────────────────────────────────────────────
    # SECTION 2: AI FRAUD DETECTION ACCURACY REPORT
    # ──────────────────────────────────────────────────
    print("\n" + "=" * 80)
    print("  AI FRAUD DETECTION ACCURACY REPORT")
    print("=" * 80)
    
    correct_count = 0
    total_evaluated = 0

    print(f"  {'User':>4} | {'Expected (Fraud?)':>17} | {'Actual Engine':>15} | {'Match':>5} | {'Claim Statement'}")
    print(f"  {'-'*4} | {'-'*17} | {'-'*15} | {'-'*5} | {'-'*30}")

    for r in results:
        # Only evaluate accuracy if the request actually completed successfully
        if r["completed"] and r["actual_fraud"] is not None:
            total_evaluated += 1
            
            # Check if expected matches actual
            is_match = (r["expected_fraud"] == r["actual_fraud"])
            
            if is_match:
                correct_count += 1
                match_icon = "✅"
            else:
                match_icon = "❌"
            
            exp_str = str(r["expected_fraud"])
            act_str = str(r["actual_fraud"])
            short_claim = r["claim_text"][:38] + ".." if len(r["claim_text"]) > 38 else r["claim_text"]
            
            print(f"  {r['user_id']:>4} | {exp_str:>17} | {act_str:>15} | {match_icon:>5} | {short_claim}")

    print("-" * 80)
    if total_evaluated > 0:
        accuracy_percentage = (correct_count / total_evaluated) * 100
        print(f"  🧠 AI ACCURACY SCORE: {correct_count} correct out of {total_evaluated} evaluated ({accuracy_percentage:.1f}%)")
        
        if accuracy_percentage >= 90:
            print("  Verdict: Excellent! The AI is highly accurate at detecting fabricated claims.")
        elif accuracy_percentage >= 70:
            print("  Verdict: Good, but there is room for prompt-tuning or better model selection.")
        else:
            print("  Verdict: Poor accuracy. The AI prompt/logic needs significant refinement.")
    else:
        print("  🧠 AI ACCURACY SCORE: 0 / 0 (No successful responses to evaluate)")
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(main())