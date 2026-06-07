"""Deterministic, offline LLM backend.

Used whenever the selected provider has no credentials, so the full UI still
works without any network access.
"""

from __future__ import annotations

from typing import AsyncGenerator, Dict, List, Optional

from backend.config import settings


class DemoLLMService:
    def __init__(self, provider: str) -> None:
        # Surface the *intended* provider so the UI can show "anthropic · DEMO".
        self.provider = provider

    async def plan(self, query: str, feedback: Optional[str] = None) -> str:
        base = query.strip().rstrip("?")
        if feedback:
            return f"{base} (key concepts, definition, comparison)"
        return f"{base} definition key concepts"

    async def evaluate(self, query: str, documents: List[Dict]) -> Dict:
        top = max((d.get("score", 0.0) for d in documents), default=0.0)
        score = round(min(1.0, top * 1.6), 2)
        sufficient = score >= settings.evaluation_threshold
        reasoning = (
            "Top document is a strong lexical match for the query."
            if sufficient
            else "Retrieved context only partially covers the query; refinement may help."
        )
        return {"score": score, "sufficient": sufficient, "reasoning": reasoning}

    async def generate(
        self, query: str, documents: List[Dict]
    ) -> AsyncGenerator[str, None]:
        if not documents:
            yield "No relevant documents were found in the knowledge base."
            return
        yield documents[0]["text"].split(". ")[0].strip() + ". "
        if len(documents) > 1:
            yield documents[1]["text"].split(". ")[0].strip() + ". "
        cites = ", ".join(f"[{i + 1}] {d['title']}" for i, d in enumerate(documents[:3]))
        yield f"\n\nSources: {cites}."
