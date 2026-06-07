"""Pluggable LLM backends (Anthropic, OpenAI, vLLM) behind one interface.

The orchestrator depends only on the ``LLMService`` protocol and the
``get_llm_service`` factory — it never imports a concrete provider.
"""

from __future__ import annotations

from backend.config import settings
from backend.services.llm.base import LLMService


def get_llm_service() -> LLMService:
    """Return the LLM backend for the configured provider.

    Falls back to the deterministic demo backend whenever the selected provider
    has no usable credentials (``settings.demo_mode``).
    """
    if settings.demo_mode:
        from backend.services.llm.demo_provider import DemoLLMService

        return DemoLLMService(settings.llm_provider)

    if settings.llm_provider == "anthropic":
        from backend.services.llm.anthropic_provider import AnthropicService

        return AnthropicService()

    if settings.llm_provider == "openai":
        from backend.services.llm.openai_provider import OpenAICompatibleService

        return OpenAICompatibleService(
            provider="openai",
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url,
            fast_model=settings.openai_fast_model,
            answer_model=settings.openai_answer_model,
        )

    if settings.llm_provider == "vllm":
        from backend.services.llm.openai_provider import OpenAICompatibleService

        return OpenAICompatibleService(
            provider="vllm",
            api_key=settings.vllm_api_key or "EMPTY",
            base_url=settings.vllm_base_url,
            fast_model=settings.vllm_model,
            answer_model=settings.vllm_model,
        )

    from backend.services.llm.demo_provider import DemoLLMService

    return DemoLLMService(settings.llm_provider)


__all__ = ["LLMService", "get_llm_service"]
