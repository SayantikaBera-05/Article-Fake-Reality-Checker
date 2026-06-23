"""Quick diagnostic to test the updated External Verification Agent pipeline."""
import asyncio
import sys
import os

os.environ["PYTHONIOENCODING"] = "utf-8"
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

async def main():
    print("=" * 60)
    print("EXTERNAL VERIFICATION AGENT - PIPELINE DIAGNOSTIC")
    print("=" * 60)

    test_claim = "NASA confirmed the Earth is flat in 2025"

    # 1. Scout test
    print(f"\n{'=' * 60}")
    print("[Phase 1] SEARCH (Serper API)...")
    from app.services.scout import Scout
    scout = Scout()
    search_results = await scout.search(test_claim)
    serper_query = f"fact check {test_claim}"
    print(f"  Results found: {len(search_results)}")
    for r in search_results[:3]:
        print(f"    - {r.title[:60]} | {r.url[:60]}")

    # 2. Reader test
    print(f"\n{'=' * 60}")
    print("[Phase 2] CONTENT EXTRACTION (Jina AI Reader)...")
    from app.services.reader import Reader
    reader = Reader()
    evidence = []
    if search_results:
        urls = [r.url for r in search_results if r.url]
        evidence = await reader.scrape_multiple(urls, max_sources=2)
        print(f"  Successfully scraped: {len(evidence)}")
        for e in evidence:
            print(f"    - {e.title[:50]} ({len(e.markdown_content)} chars)")

    # 3. Analyst test
    print(f"\n{'=' * 60}")
    mode = "EVIDENCE-BACKED" if evidence else "NO-EVIDENCE"
    print(f"[Phase 3] CROSS-EXAMINATION ({mode}) via OpenRouter...")
    from app.services.analyst import Analyst
    analyst = Analyst()
    
    verdict = await analyst.investigate(
        claim=test_claim,
        evidence=evidence if evidence else None,
        search_results=search_results if search_results else None,
        serper_query=serper_query,
    )

    # 4. Verification Report
    print(f"\n{'=' * 60}")
    print("VERIFICATION REPORT")
    print(f"{'=' * 60}")
    print(f"  Verification Status: {verdict.verificationStatus}")
    print(f"  isFraud: {verdict.isFraud}")
    print(f"  riskScore: {verdict.riskScore}")
    print(f"  confidenceLevel: {verdict.confidenceLevel.value}")
    print(f"  sources: {len(verdict.sources)}")
    print(f"  evidence timeline items: {len(verdict.evidenceTimeline)}")
    
    if verdict.auditTrail:
        print(f"\n  --- AUDIT TRAIL ---")
        print(f"  Serper Query: {verdict.auditTrail.serperQuery}")
        print(f"  Jina URLs Processed: {verdict.auditTrail.jinaUrlsProcessed}")
        print(f"  OpenRouter Model: {verdict.auditTrail.openrouterModel}")

    if verdict.evidenceTimeline:
        print(f"\n  --- EVIDENCE TIMELINE ---")
        for item in verdict.evidenceTimeline:
            print(f"    * {item[:100]}")

    print(f"\n  --- EXECUTIVE SUMMARY ---")
    print(f"  {verdict.analysisSummary[:300]}")
    print(f"{'=' * 60}")

if __name__ == "__main__":
    asyncio.run(main())
