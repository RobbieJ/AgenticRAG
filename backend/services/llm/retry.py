"""Transient-failure retry with exponential backoff for LLM provider calls.

Provider-agnostic by design: errors are classified by HTTP status code and
exception class name rather than by importing each SDK's exception types, so the
same logic covers Anthropic, OpenAI, and vLLM. Non-retryable failures (e.g. bad
credentials) are re-raised immediately as a ``RuntimeError`` carrying a
presenter-friendly message — the orchestrator streams that text to the client.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Awaitable, Callable, Optional, TypeVar

logger = logging.getLogger("agentic_rag.llm")

T = TypeVar("T")

# HTTP statuses worth retrying: rate limiting + transient upstream errors.
_RETRYABLE_STATUS = {408, 409, 429, 500, 502, 503, 504}
# Exception class names (across SDKs) that signal a transient problem.
_RETRYABLE_NAMES = {
    "APIConnectionError",
    "APIConnectionTimeoutError",
    "APITimeoutError",
    "InternalServerError",
    "RateLimitError",
    "ServiceUnavailableError",
}
_AUTH_NAMES = {"AuthenticationError", "PermissionDeniedError"}


def _status(exc: Exception) -> Optional[int]:
    return getattr(exc, "status_code", None) or getattr(exc, "status", None)


def is_retryable(exc: Exception) -> bool:
    """True for rate limits, timeouts, and transient 5xx/connection errors."""
    if type(exc).__name__ in _RETRYABLE_NAMES:
        return True
    status = _status(exc)
    return status in _RETRYABLE_STATUS if status else False


def friendly_message(exc: Exception) -> str:
    """A short, user-facing explanation suitable for showing a presenter."""
    name = type(exc).__name__
    status = _status(exc)
    if name in _AUTH_NAMES or status in (401, 403):
        return (
            "The LLM provider rejected the credentials. Check the API key for the "
            "configured provider (or unset it to run in offline DEMO mode)."
        )
    if name == "RateLimitError" or status == 429:
        return "The LLM provider is rate-limiting requests — please retry in a moment."
    if is_retryable(exc):
        return "The LLM provider is temporarily unavailable — please retry."
    return f"LLM request failed: {exc}"


async def retry_async(
    fn: Callable[[], Awaitable[T]],
    *,
    op: str,
    attempts: int = 3,
    base_delay: float = 0.6,
) -> T:
    """Await ``fn`` with exponential backoff on transient failures.

    Re-raises non-retryable errors (and the final attempt) as ``RuntimeError``
    with a friendly message so the failure surfaces cleanly to the client.
    """
    last: Optional[Exception] = None
    for attempt in range(1, attempts + 1):
        try:
            return await fn()
        except Exception as exc:  # noqa: BLE001 — classified by is_retryable
            last = exc
            if not is_retryable(exc) or attempt == attempts:
                raise RuntimeError(friendly_message(exc)) from exc
            delay = base_delay * (2 ** (attempt - 1))
            logger.warning(
                "LLM %s failed (attempt %d/%d): %s — retrying in %.1fs",
                op, attempt, attempts, type(exc).__name__, delay,
            )
            await asyncio.sleep(delay)
    # Unreachable, but keeps type-checkers happy.
    raise RuntimeError(friendly_message(last) if last else "LLM call failed")
