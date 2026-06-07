"""The provider-agnostic interface and shared prompt/parse helpers."""

from __future__ import annotations

import json
from typing import AsyncGenerator, Dict, List, Optional, Protocol, Tuple, runtime_checkable

from backend.config import settings

# Usage is a simple {"in": prompt_tokens, "out": completion_tokens} dict.
Usage = Dict[str, int]


def estimate_tokens(text: str) -> int:
    """Rough token estimate (~4 chars/token) for DEMO mode and provider fallbacks."""
    return max(1, round(len(text or "") / 4))

# JSON schema for the EVALUATE step's structured output.
EVAL_SCHEMA = {
    "type": "object",
    "properties": {
        "score": {"type": "number"},
        "sufficient": {"type": "boolean"},
        "reasoning": {"type": "string"},
    },
    "required": ["score", "sufficient", "reasoning"],
    "additionalProperties": False,
}

EVAL_SYSTEM = (
    "You evaluate whether retrieved documents are relevant and sufficient to answer "
    "a question. Score from 0 (useless) to 1 (fully sufficient). Respond with a JSON "
    'object: {"score": number, "sufficient": boolean, "reasoning": string}.'
)

GENERATE_SYSTEM = (
    "You are a precise assistant. Answer the question using only the provided context. "
    "Cite sources inline as [n]. If the context is insufficient, say so explicitly."
)


@runtime_checkable
class LLMService(Protocol):
    """Every provider implements these three loop operations plus identity fields.

    ``plan`` and ``evaluate`` return ``(result, usage)``. ``generate`` streams text
    and records the generation's token usage on ``last_usage`` once the stream ends.
    """

    provider: str
    last_usage: Usage

    async def plan(self, query: str, feedback: Optional[str] = None) -> Tuple[str, Usage]: ...

    async def evaluate(self, query: str, documents: List[Dict]) -> Tuple[Dict, Usage]: ...

    def generate(self, query: str, documents: List[Dict]) -> AsyncGenerator[str, None]: ...


# --------------------------------------------------------------- prompt builders
def plan_prompt(query: str, feedback: Optional[str]) -> str:
    prompt = (
        "Rewrite the user's question into a concise search query optimized for "
        "document retrieval. Focus on the key nouns and concepts. Return only the "
        f"rewritten query, with no preamble.\n\nQuestion: {query}"
    )
    if feedback:
        prompt += f"\n\nThe previous attempt was insufficient because: {feedback}"
    return prompt


def eval_user_prompt(query: str, documents: List[Dict]) -> str:
    context = "\n\n".join(f"[{d['title']}] {d['text'][:300]}" for d in documents[:4])
    return f"Question: {query}\n\nRetrieved documents:\n{context}"


def generate_user_prompt(query: str, documents: List[Dict]) -> str:
    context = "\n\n".join(
        f"[{i + 1}] {d['title']}\n{d['text']}" for i, d in enumerate(documents)
    )
    return f"Context:\n{context}\n\nQuestion: {query}"


def parse_eval(raw: str) -> Dict:
    """Parse a model's JSON evaluation, tolerating extra prose around the object."""
    text = (raw or "").strip()
    # Be lenient: pull out the first {...} block if the model added prose.
    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start : end + 1]
    try:
        data = json.loads(text)
        score = float(data.get("score", 0.0))
        return {
            "score": round(max(0.0, min(1.0, score)), 2),
            "sufficient": bool(
                data.get("sufficient", score >= settings.evaluation_threshold)
            ),
            "reasoning": str(data.get("reasoning", "")),
        }
    except (json.JSONDecodeError, ValueError, TypeError):
        return {"score": 0.5, "sufficient": False, "reasoning": "Could not parse evaluation."}
