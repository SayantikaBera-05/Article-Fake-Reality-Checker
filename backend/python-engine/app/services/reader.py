"""
Reader Service — Jina AI Scraper Agent

Converts web page URLs into clean, LLM-friendly Markdown using
the Jina AI Reader API (r.jina.ai). This scraped content serves
as evidence for the Analyst stage in the RAG pipeline.

Author: Joy-S-07
"""

import httpx
import traceback
from dataclasses import dataclass
from typing import Optional

from app.config import settings


# ─── Data Structures ───────────────────────────────


@dataclass
class ScrapedContent:
    """The result of scraping a single URL via Jina AI Reader."""

    url: str
    title: str
    markdown_content: str
    success: bool
    error: Optional[str] = None


# ─── Reader Agent ──────────────────────────────────


class Reader:
    """
    Jina AI Reader agent — converts web pages to clean Markdown.

    Uses the free r.jina.ai endpoint to fetch a URL and return its
    content as structured Markdown, stripped of ads, navbars, and
    boilerplate. Content is truncated to stay within LLM context limits.

    Usage:
        reader = Reader()
        content = await reader.scrape("https://reuters.com/article/...")
    """

    # Maximum characters of scraped content to keep.
    # ~4000 chars ≈ ~1000 tokens — leaves room for the prompt + claim.
    MAX_CONTENT_LENGTH: int = 6000

    def __init__(self):
        """Initialize the Reader with Jina configuration."""
        self.base_url: str = settings.JINA_READER_BASE_URL
        self.timeout: int = settings.JINA_TIMEOUT
        print(f"[READER] Jina AI Reader initialized (timeout: {self.timeout}s)", flush=True)

    async def scrape(self, url: str) -> ScrapedContent:
        """
        Scrape a single URL into clean Markdown via Jina AI Reader.

        The endpoint is simply: GET https://r.jina.ai/{target_url}
        Jina handles JavaScript rendering, ad removal, and conversion.

        Args:
            url: The target web page URL to scrape.

        Returns:
            A ScrapedContent object with the Markdown content.
            On failure, success=False and error contains the reason.
        """
        if not url or not url.startswith("http"):
            return ScrapedContent(
                url=url or "",
                title="Invalid URL",
                markdown_content="",
                success=False,
                error="URL is empty or does not start with http",
            )

        jina_url = f"{self.base_url}/{url}"

        try:
            async with httpx.AsyncClient(timeout=float(self.timeout)) as client:
                response = await client.get(
                    jina_url,
                    headers={
                        "Accept": "text/markdown",
                        "X-No-Cache": "true",
                    },
                )
                response.raise_for_status()
                raw_content = response.text

            # Extract title from the first markdown heading, if present
            title = self._extract_title(raw_content, url)

            # Truncate to avoid blowing up the LLM context window
            truncated = self._truncate(raw_content)

            print(f"[READER] Scraped {len(raw_content)} chars from {url[:60]}... (kept {len(truncated)})", flush=True)

            return ScrapedContent(
                url=url,
                title=title,
                markdown_content=truncated,
                success=True,
            )

        except httpx.TimeoutException:
            msg = f"Timed out after {self.timeout}s"
            print(f"[READER] WARNING: {msg}: {url[:80]}", flush=True)
            return ScrapedContent(url=url, title="", markdown_content="", success=False, error=msg)

        except httpx.HTTPStatusError as e:
            msg = f"HTTP {e.response.status_code}"
            print(f"[READER] WARNING: {msg}: {url[:80]}", flush=True)
            return ScrapedContent(url=url, title="", markdown_content="", success=False, error=msg)

        except Exception as e:
            msg = f"{type(e).__name__}: {e}"
            print(f"[READER] WARNING: Unexpected error: {msg}", flush=True)
            traceback.print_exc()
            return ScrapedContent(url=url, title="", markdown_content="", success=False, error=msg)

    async def scrape_multiple(self, urls: list[str], max_sources: int = 3) -> list[ScrapedContent]:
        """
        Scrape multiple URLs sequentially, stopping after max_sources successes.

        Args:
            urls: List of URLs to attempt scraping.
            max_sources: Maximum number of successful scrapes to return.

        Returns:
            A list of successfully scraped ScrapedContent objects.
        """
        results: list[ScrapedContent] = []

        for url in urls:
            if len(results) >= max_sources:
                break

            content = await self.scrape(url)
            if content.success and content.markdown_content.strip():
                results.append(content)

        print(f"[READER] Scraped {len(results)}/{len(urls)} URLs successfully", flush=True)
        return results

    # ─── Helpers ─────────────────────────────────────

    def _extract_title(self, markdown: str, fallback_url: str) -> str:
        """Extract the first H1 heading from Markdown, or fall back to URL."""
        for line in markdown.split("\n")[:10]:
            stripped = line.strip()
            if stripped.startswith("# "):
                return stripped[2:].strip()
        return fallback_url[:100]

    def _truncate(self, content: str) -> str:
        """Truncate content to MAX_CONTENT_LENGTH, breaking at a sentence."""
        if len(content) <= self.MAX_CONTENT_LENGTH:
            return content

        truncated = content[: self.MAX_CONTENT_LENGTH]

        # Try to break at the last sentence boundary
        for boundary in [". ", ".\n", "! ", "?\n"]:
            last_break = truncated.rfind(boundary)
            if last_break > self.MAX_CONTENT_LENGTH * 0.7:
                return truncated[: last_break + 1] + "\n\n[... content truncated for analysis ...]"

        return truncated + "\n\n[... content truncated for analysis ...]"