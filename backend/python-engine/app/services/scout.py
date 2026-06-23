"""
Scout Service -- Serper.dev Search Agent

Retrieves real-time Google search results for a given claim using
the Serper.dev API. Returns structured search results that feed
into the Reader and Analyst stages of the RAG pipeline.

Author: Joy-S-07
"""

import httpx
import traceback
from dataclasses import dataclass, field
from typing import List, Optional

from app.config import settings


# ─── Data Structures ───────────────────────────────


@dataclass
class SearchResult:
    """A single search result returned by Serper."""

    title: str
    url: str
    snippet: str
    position: int = 0


# ─── Scout Agent ───────────────────────────────────


class Scout:
    """
    Serper.dev search agent -- retrieves real-time Google results for a claim.

    Prepends "fact check" to the user's query to bias results toward
    verification-oriented sources (e.g., Snopes, Reuters Fact Check,
    PolitiFact, AP News). Returns a list of SearchResult objects.

    Usage:
        scout = Scout()
        results = await scout.search("NASA confirmed the Earth is flat")
    """

    def __init__(self):
        """Initialize the Scout with Serper configuration."""
        self.api_key: Optional[str] = settings.SERPER_API_KEY
        self.endpoint: str = settings.SERPER_ENDPOINT
        self.num_results: int = settings.SERPER_NUM_RESULTS

        if self.api_key:
            print(f"[SCOUT] Serper.dev agent initialized (top {self.num_results} results)", flush=True)
        else:
            print("[SCOUT] WARNING: No SERPER_API_KEY -- web search will be skipped", flush=True)

    @property
    def is_available(self) -> bool:
        """Check if the Scout has a valid Serper API key configured."""
        return bool(self.api_key)

    async def search(self, claim: str, num_results: Optional[int] = None) -> List[SearchResult]:
        """
        Search Google for the given claim via Serper.dev.

        The query is prefixed with "fact check" to prioritize
        verification and debunking sources in the results.

        Args:
            claim: The user-submitted claim or article text to search for.
            num_results: Override the default number of results.

        Returns:
            A list of SearchResult objects, ordered by relevance.
            Returns an empty list if the API key is missing or the request fails.
        """
        if not self.is_available:
            print("[SCOUT] Skipped -- no API key configured", flush=True)
            return []

        # Truncate very long claims to a searchable query
        query_text = claim.strip()[:300]
        search_query = f"fact check {query_text}"

        results_count = num_results or self.num_results

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    self.endpoint,
                    headers={
                        "X-API-KEY": self.api_key,
                        "Content-Type": "application/json",
                    },
                    json={
                        "q": search_query,
                        "num": results_count,
                    },
                )
                response.raise_for_status()
                data = response.json()

            # Parse organic results
            organic = data.get("organic", [])
            results: List[SearchResult] = []

            for idx, item in enumerate(organic[:results_count]):
                results.append(
                    SearchResult(
                        title=item.get("title", "Untitled"),
                        url=item.get("link", ""),
                        snippet=item.get("snippet", ""),
                        position=idx + 1,
                    )
                )

            print(f"[SCOUT] Found {len(results)} results for: {search_query[:80]}...", flush=True)
            return results

        except httpx.TimeoutException:
            print("[SCOUT] WARNING: Request timed out -- Serper.dev unreachable", flush=True)
            return []
        except httpx.HTTPStatusError as e:
            print(f"[SCOUT] WARNING: HTTP {e.response.status_code}: {e.response.text[:200]}", flush=True)
            return []
        except Exception as e:
            print(f"[SCOUT] WARNING: Unexpected error: {type(e).__name__}: {e}", flush=True)
            traceback.print_exc()
            return []