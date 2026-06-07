"""Deterministic, offline LLM backend.

Used whenever the selected provider has no credentials, so the full UI still
works without any network access. Token usage is estimated from prompt/output
length so the Token Burn meter behaves realistically offline.
"""

from __future__ import annotations

import json
from typing import AsyncGenerator, Dict, List, Optional, Tuple

from backend.config import settings
from backend.services.llm.base import (
    EVAL_SYSTEM,
    GENERATE_SYSTEM,
    Usage,
    estimate_tokens,
    eval_user_prompt,
    generate_user_prompt,
    plan_prompt,
)


class DemoLLMService:
    def __init__(self, provider: str) -> None:
        # Surface the *intended* provider so the UI can show "anthropic · DEMO".
        self.provider = provider
        self.last_usage: Usage = {"in": 0, "out": 0}

    async def plan(self, query: str, feedback: Optional[str] = None) -> Tuple[str, Usage]:
        base = query.strip().rstrip("?")
        result = (
            f"{base} (key concepts, definition, comparison)"
            if feedback
            else f"{base} definition key concepts"
        )
        usage = {
            "in": estimate_tokens(plan_prompt(query, feedback)),
            "out": estimate_tokens(result),
        }
        return result, usage

    async def evaluate(self, query: str, documents: List[Dict]) -> Tuple[Dict, Usage]:
        top = max((d.get("score", 0.0) for d in documents), default=0.0)
        score = round(min(1.0, top * 1.6), 2)
        sufficient = score >= settings.evaluation_threshold
        verdict = {
            "score": score,
            "sufficient": sufficient,
            "reasoning": (
                "Top document is a strong lexical match for the query."
                if sufficient
                else "Retrieved context only partially covers the query; refinement may help."
            ),
        }
        usage = {
            "in": estimate_tokens(EVAL_SYSTEM + eval_user_prompt(query, documents)),
            "out": estimate_tokens(json.dumps(verdict)),
        }
        return verdict, usage

    async def generate(
        self, query: str, documents: List[Dict]
    ) -> AsyncGenerator[str, None]:
        full = ""
        if not documents:
            full = "No relevant documents were found in the knowledge base."
            yield full
        else:
            parts = [documents[0]["text"].split(". ")[0].strip() + ". "]
            if len(documents) > 1:
                parts.append(documents[1]["text"].split(". ")[0].strip() + ". ")
            cites = ", ".join(
                f"[{i + 1}] {d['title']}" for i, d in enumerate(documents[:3])
            )
            parts.append(f"\n\nSources: {cites}.")
            for p in parts:
                full += p
                yield p
        self.last_usage = {
            "in": estimate_tokens(GENERATE_SYSTEM + generate_user_prompt(query, documents)),
            "out": estimate_tokens(full),
        }
