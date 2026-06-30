"""Anthropic Claude backend."""

from __future__ import annotations

import asyncio
from typing import AsyncGenerator, Dict, List, Optional, Tuple

import anthropic

from backend.config import settings
from backend.services.llm.base import (
    EVAL_SCHEMA,
    EVAL_SYSTEM,
    GENERATE_SYSTEM,
    Usage,
    eval_user_prompt,
    generate_user_prompt,
    parse_eval,
    plan_prompt,
)
from backend.services.llm.retry import friendly_message, is_retryable, retry_async


class AnthropicService:
    provider = "anthropic"

    def __init__(self) -> None:
        self.client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
        self.fast_model = settings.anthropic_fast_model
        self.answer_model = settings.anthropic_answer_model
        self.last_usage: Usage = {"in": 0, "out": 0}

    async def plan(self, query: str, feedback: Optional[str] = None) -> Tuple[str, Usage]:
        async def _call():
            return await self.client.messages.create(
                model=self.fast_model,
                max_tokens=120,
                messages=[{"role": "user", "content": plan_prompt(query, feedback)}],
            )

        message = await retry_async(_call, op="plan")
        return (self._text(message).strip() or query), self._usage(message)

    async def evaluate(self, query: str, documents: List[Dict]) -> Tuple[Dict, Usage]:
        async def _call():
            return await self.client.messages.create(
                model=self.fast_model,
                max_tokens=300,
                system=EVAL_SYSTEM,
                messages=[{"role": "user", "content": eval_user_prompt(query, documents)}],
                output_config={"format": {"type": "json_schema", "schema": EVAL_SCHEMA}},
            )

        message = await retry_async(_call, op="evaluate")
        return parse_eval(self._text(message)), self._usage(message)

    async def generate(
        self, query: str, documents: List[Dict]
    ) -> AsyncGenerator[str, None]:
        # Retry only while no text has been emitted yet — once the stream starts
        # producing tokens we can't safely restart it, so a mid-stream failure
        # propagates as a friendly error instead.
        for attempt in range(1, 4):
            produced = False
            try:
                async with self.client.messages.stream(
                    model=self.answer_model,
                    max_tokens=600,
                    system=GENERATE_SYSTEM,
                    messages=[
                        {"role": "user", "content": generate_user_prompt(query, documents)}
                    ],
                ) as stream:
                    async for text in stream.text_stream:
                        produced = True
                        yield text
                    final = await stream.get_final_message()
                    self.last_usage = self._usage(final)
                return
            except Exception as exc:  # noqa: BLE001 — classified by is_retryable
                if produced or not is_retryable(exc) or attempt == 3:
                    raise RuntimeError(friendly_message(exc)) from exc
                await asyncio.sleep(0.6 * 2 ** (attempt - 1))

    @staticmethod
    def _text(message: "anthropic.types.Message") -> str:
        for block in message.content:
            if block.type == "text":
                return block.text
        return ""

    @staticmethod
    def _usage(message: "anthropic.types.Message") -> Usage:
        u = getattr(message, "usage", None)
        return {
            "in": getattr(u, "input_tokens", 0) or 0,
            "out": getattr(u, "output_tokens", 0) or 0,
        }
