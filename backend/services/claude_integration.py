"""Anthropic Claude integration for the agentic RAG loop.

Three operations map to the loop steps:
  - plan():     rewrite the user question for better retrieval  (fast model)
  - evaluate(): judge whether retrieved evidence is sufficient  (fast model, structured output)
  - generate(): synthesize a grounded answer, streamed token by token (answer model)

When no API key is configured (DEMO mode) every method returns a deterministic,
offline result derived from the retrieved documents so the full UI still works.
"""

from __future__ import annotations

import json
from typing import AsyncGenerator, Dict, List, Optional

import anthropic

from backend.config import settings


class ClaudeService:
    def __init__(self) -> None:
        self.demo_mode = settings.demo_mode
        self.client: Optional[anthropic.AsyncAnthropic] = (
            None if self.demo_mode else anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
        )

    # ------------------------------------------------------------------ PLAN
    async def plan(self, query: str, feedback: Optional[str] = None) -> str:
        """Rewrite the query into a focused retrieval query."""
        if self.demo_mode or self.client is None:
            base = query.strip().rstrip("?")
            if feedback:
                return f"{base} (key concepts, definition, comparison)"
            return f"{base} definition key concepts"

        instruction = (
            "Rewrite the user's question into a concise search query optimized for "
            "document retrieval. Focus on the key nouns and concepts. Return only the "
            "rewritten query, with no preamble.\n\n"
            f"Question: {query}"
        )
        if feedback:
            instruction += f"\n\nThe previous attempt was insufficient because: {feedback}"

        message = await self.client.messages.create(
            model=settings.fast_model,
            max_tokens=120,
            messages=[{"role": "user", "content": instruction}],
        )
        return self._first_text(message).strip() or query

    # -------------------------------------------------------------- EVALUATE
    async def evaluate(self, query: str, documents: List[Dict]) -> Dict:
        """Return {score: float 0-1, sufficient: bool, reasoning: str}."""
        if self.demo_mode or self.client is None:
            top = max((d.get("score", 0.0) for d in documents), default=0.0)
            # Map the retriever's cosine score onto a confidence-like value.
            score = round(min(1.0, top * 1.6), 2)
            sufficient = score >= settings.evaluation_threshold
            reasoning = (
                "Top document is a strong lexical match for the query."
                if sufficient
                else "Retrieved context only partially covers the query; refinement may help."
            )
            return {"score": score, "sufficient": sufficient, "reasoning": reasoning}

        context = "\n\n".join(
            f"[{d['title']}] {d['text'][:300]}" for d in documents[:4]
        )
        schema = {
            "type": "object",
            "properties": {
                "score": {"type": "number"},
                "sufficient": {"type": "boolean"},
                "reasoning": {"type": "string"},
            },
            "required": ["score", "sufficient", "reasoning"],
            "additionalProperties": False,
        }
        message = await self.client.messages.create(
            model=settings.fast_model,
            max_tokens=300,
            system=(
                "You evaluate whether retrieved documents are relevant and sufficient "
                "to answer a question. Score from 0 (useless) to 1 (fully sufficient)."
            ),
            messages=[
                {
                    "role": "user",
                    "content": f"Question: {query}\n\nRetrieved documents:\n{context}",
                }
            ],
            output_config={"format": {"type": "json_schema", "schema": schema}},
        )
        raw = self._first_text(message)
        try:
            data = json.loads(raw)
            score = float(data.get("score", 0.0))
            return {
                "score": round(max(0.0, min(1.0, score)), 2),
                "sufficient": bool(data.get("sufficient", score >= settings.evaluation_threshold)),
                "reasoning": str(data.get("reasoning", "")),
            }
        except (json.JSONDecodeError, ValueError, TypeError):
            return {"score": 0.5, "sufficient": False, "reasoning": "Could not parse evaluation."}

    # -------------------------------------------------------------- GENERATE
    async def generate(self, query: str, documents: List[Dict]) -> AsyncGenerator[str, None]:
        """Stream a grounded answer token by token."""
        if self.demo_mode or self.client is None:
            for chunk in self._demo_answer(query, documents):
                yield chunk
            return

        context = "\n\n".join(
            f"[{i + 1}] {d['title']}\n{d['text']}" for i, d in enumerate(documents)
        )
        async with self.client.messages.stream(
            model=settings.answer_model,
            max_tokens=600,
            system=(
                "You are a precise assistant. Answer the question using only the "
                "provided context. Cite sources inline as [n]. If the context is "
                "insufficient, say so explicitly."
            ),
            messages=[
                {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"}
            ],
        ) as stream:
            async for text in stream.text_stream:
                yield text

    # ------------------------------------------------------------- internals
    @staticmethod
    def _first_text(message: anthropic.types.Message) -> str:
        for block in message.content:
            if block.type == "text":
                return block.text
        return ""

    @staticmethod
    def _demo_answer(query: str, documents: List[Dict]):
        """Deterministic, grounded answer used when no API key is set."""
        if not documents:
            yield "No relevant documents were found in the knowledge base."
            return
        lead = documents[0]
        first_sentence = lead["text"].split(". ")[0].strip()
        yield f"{first_sentence}. "
        if len(documents) > 1:
            supporting = documents[1]["text"].split(". ")[0].strip()
            yield f"{supporting}. "
        cites = ", ".join(f"[{i + 1}] {d['title']}" for i, d in enumerate(documents[:3]))
        yield f"\n\nSources: {cites}."
