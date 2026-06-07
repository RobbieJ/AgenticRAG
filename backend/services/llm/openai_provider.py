"""OpenAI-compatible backend.

Drives both hosted OpenAI and a local vLLM server — vLLM exposes the same
``/v1/chat/completions`` API, so the only differences are ``base_url``, the API
key, and the model name.
"""

from __future__ import annotations

from typing import AsyncGenerator, Dict, List, Optional

from openai import AsyncOpenAI

from backend.services.llm.base import (
    EVAL_SYSTEM,
    GENERATE_SYSTEM,
    eval_user_prompt,
    generate_user_prompt,
    parse_eval,
    plan_prompt,
)


class OpenAICompatibleService:
    def __init__(
        self,
        provider: str,
        api_key: str,
        base_url: str,
        fast_model: str,
        answer_model: str,
    ) -> None:
        self.provider = provider
        self.fast_model = fast_model
        self.answer_model = answer_model
        # vLLM accepts any non-empty key; OpenAI uses the real one.
        self.client = AsyncOpenAI(api_key=api_key or "EMPTY", base_url=base_url)

    async def plan(self, query: str, feedback: Optional[str] = None) -> str:
        resp = await self.client.chat.completions.create(
            model=self.fast_model,
            max_tokens=120,
            messages=[{"role": "user", "content": plan_prompt(query, feedback)}],
        )
        return (resp.choices[0].message.content or "").strip() or query

    async def evaluate(self, query: str, documents: List[Dict]) -> Dict:
        messages = [
            {"role": "system", "content": EVAL_SYSTEM},
            {"role": "user", "content": eval_user_prompt(query, documents)},
        ]
        # Prefer JSON-mode where supported; fall back for models/servers that
        # reject response_format (some vLLM builds). parse_eval is lenient either way.
        try:
            resp = await self.client.chat.completions.create(
                model=self.fast_model,
                max_tokens=300,
                messages=messages,
                response_format={"type": "json_object"},
            )
        except Exception:
            resp = await self.client.chat.completions.create(
                model=self.fast_model,
                max_tokens=300,
                messages=messages,
            )
        return parse_eval(resp.choices[0].message.content or "")

    async def generate(
        self, query: str, documents: List[Dict]
    ) -> AsyncGenerator[str, None]:
        stream = await self.client.chat.completions.create(
            model=self.answer_model,
            max_tokens=600,
            messages=[
                {"role": "system", "content": GENERATE_SYSTEM},
                {"role": "user", "content": generate_user_prompt(query, documents)},
            ],
            stream=True,
        )
        async for chunk in stream:
            if not chunk.choices:
                continue
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta
