"""OpenAI-compatible backend.

Drives both hosted OpenAI and a local vLLM server — vLLM exposes the same
``/v1/chat/completions`` API, so the only differences are ``base_url``, the API
key, and the model name.
"""

from __future__ import annotations

from typing import AsyncGenerator, Dict, List, Optional, Tuple

from openai import AsyncOpenAI

from backend.services.llm.base import (
    EVAL_SYSTEM,
    GENERATE_SYSTEM,
    Usage,
    estimate_tokens,
    eval_user_prompt,
    generate_user_prompt,
    parse_eval,
    plan_prompt,
)
from backend.services.llm.retry import friendly_message, is_retryable, retry_async


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
        self.last_usage: Usage = {"in": 0, "out": 0}

    async def plan(self, query: str, feedback: Optional[str] = None) -> Tuple[str, Usage]:
        prompt = plan_prompt(query, feedback)

        async def _call():
            return await self.client.chat.completions.create(
                model=self.fast_model,
                max_tokens=120,
                messages=[{"role": "user", "content": prompt}],
            )

        resp = await retry_async(_call, op="plan")
        text = (resp.choices[0].message.content or "").strip() or query
        return text, self._usage(resp, prompt, text)

    async def evaluate(self, query: str, documents: List[Dict]) -> Tuple[Dict, Usage]:
        user = eval_user_prompt(query, documents)
        messages = [
            {"role": "system", "content": EVAL_SYSTEM},
            {"role": "user", "content": user},
        ]

        # Prefer JSON-mode where supported; fall back for servers that reject it.
        # The fallback only triggers on a json-mode rejection — transient network
        # failures are retried by retry_async rather than silently downgraded.
        async def _call():
            try:
                return await self.client.chat.completions.create(
                    model=self.fast_model,
                    max_tokens=300,
                    messages=messages,
                    response_format={"type": "json_object"},
                )
            except Exception as exc:  # noqa: BLE001
                if is_retryable(exc):
                    raise  # let retry_async handle transient failures
                return await self.client.chat.completions.create(
                    model=self.fast_model,
                    max_tokens=300,
                    messages=messages,
                )

        resp = await retry_async(_call, op="evaluate")
        raw = resp.choices[0].message.content or ""
        return parse_eval(raw), self._usage(resp, EVAL_SYSTEM + user, raw)

    async def generate(
        self, query: str, documents: List[Dict]
    ) -> AsyncGenerator[str, None]:
        prompt = generate_user_prompt(query, documents)

        async def _open_stream():
            return await self.client.chat.completions.create(
                model=self.answer_model,
                max_tokens=600,
                messages=[
                    {"role": "system", "content": GENERATE_SYSTEM},
                    {"role": "user", "content": prompt},
                ],
                stream=True,
                stream_options={"include_usage": True},
            )

        # Retry opening the stream (transient failures before any token); once
        # tokens flow, a failure propagates as a friendly error.
        stream = await retry_async(_open_stream, op="generate")
        full = ""
        usage = None
        try:
            async for chunk in stream:
                if getattr(chunk, "usage", None):
                    usage = chunk.usage  # final usage-only chunk
                if chunk.choices:
                    delta = chunk.choices[0].delta.content
                    if delta:
                        full += delta
                        yield delta
        except Exception as exc:  # noqa: BLE001 — mid-stream failure
            if not full:
                raise RuntimeError(friendly_message(exc)) from exc
            raise  # already partially streamed; let it surface
        if usage is not None:
            self.last_usage = {
                "in": usage.prompt_tokens or 0,
                "out": usage.completion_tokens or 0,
            }
        else:  # server didn't return usage — estimate
            self.last_usage = {
                "in": estimate_tokens(GENERATE_SYSTEM + prompt),
                "out": estimate_tokens(full),
            }

    @staticmethod
    def _usage(resp, prompt_text: str, output_text: str) -> Usage:
        u = getattr(resp, "usage", None)
        if u is not None:
            return {"in": u.prompt_tokens or 0, "out": u.completion_tokens or 0}
        return {"in": estimate_tokens(prompt_text), "out": estimate_tokens(output_text)}
