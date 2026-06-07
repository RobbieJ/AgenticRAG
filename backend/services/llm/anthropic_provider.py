"""Anthropic Claude backend."""

from __future__ import annotations

from typing import AsyncGenerator, Dict, List, Optional

import anthropic

from backend.config import settings
from backend.services.llm.base import (
    EVAL_SCHEMA,
    EVAL_SYSTEM,
    GENERATE_SYSTEM,
    eval_user_prompt,
    generate_user_prompt,
    parse_eval,
    plan_prompt,
)


class AnthropicService:
    provider = "anthropic"

    def __init__(self) -> None:
        self.client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
        self.fast_model = settings.anthropic_fast_model
        self.answer_model = settings.anthropic_answer_model

    async def plan(self, query: str, feedback: Optional[str] = None) -> str:
        message = await self.client.messages.create(
            model=self.fast_model,
            max_tokens=120,
            messages=[{"role": "user", "content": plan_prompt(query, feedback)}],
        )
        return self._text(message).strip() or query

    async def evaluate(self, query: str, documents: List[Dict]) -> Dict:
        message = await self.client.messages.create(
            model=self.fast_model,
            max_tokens=300,
            system=EVAL_SYSTEM,
            messages=[{"role": "user", "content": eval_user_prompt(query, documents)}],
            output_config={"format": {"type": "json_schema", "schema": EVAL_SCHEMA}},
        )
        return parse_eval(self._text(message))

    async def generate(
        self, query: str, documents: List[Dict]
    ) -> AsyncGenerator[str, None]:
        async with self.client.messages.stream(
            model=self.answer_model,
            max_tokens=600,
            system=GENERATE_SYSTEM,
            messages=[{"role": "user", "content": generate_user_prompt(query, documents)}],
        ) as stream:
            async for text in stream.text_stream:
                yield text

    @staticmethod
    def _text(message: "anthropic.types.Message") -> str:
        for block in message.content:
            if block.type == "text":
                return block.text
        return ""
