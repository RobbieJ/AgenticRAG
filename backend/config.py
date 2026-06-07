"""Application configuration.

Supports three LLM backends, selected by ``LLM_PROVIDER``:

  - ``anthropic`` : Claude via the Anthropic SDK
  - ``openai``    : OpenAI (or any OpenAI-compatible hosted API)
  - ``vllm``      : a locally hosted model served by vLLM's OpenAI-compatible API

Retrieval is always in-process (no external vector DB). When the selected
provider has no credentials configured, the app runs in DEMO mode and serves
deterministic, offline answers so a presenter can still drive the full UI.
"""

from __future__ import annotations

from typing import List, Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

Provider = Literal["anthropic", "openai", "vllm"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # --- API metadata ---
    api_title: str = "Agentic RAG Demo API"
    api_version: str = "1.0.0"
    debug: bool = False

    # --- Which LLM backend to use ---
    llm_provider: Provider = "anthropic"

    # --- Anthropic ---
    anthropic_api_key: str = ""
    anthropic_fast_model: str = "claude-haiku-4-5"
    anthropic_answer_model: str = "claude-sonnet-4-6"

    # --- OpenAI (and OpenAI-compatible hosted APIs) ---
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    openai_fast_model: str = "gpt-4o-mini"
    openai_answer_model: str = "gpt-4o"

    # --- vLLM (local, OpenAI-compatible server) ---
    # Default port is 8001 to avoid colliding with this backend on 8000.
    vllm_base_url: str = "http://localhost:8001/v1"
    vllm_api_key: str = "EMPTY"  # vLLM ignores the key unless configured otherwise
    vllm_model: str = ""  # must match the model name vLLM was started with

    # --- Agentic loop tuning ---
    max_iterations: int = 3
    evaluation_threshold: float = 0.7
    retrieval_top_k: int = 4

    # --- CORS ---
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @property
    def demo_mode(self) -> bool:
        """True when the selected provider lacks the config needed to run live."""
        if self.llm_provider == "anthropic":
            return not self.anthropic_api_key.strip()
        if self.llm_provider == "openai":
            return not self.openai_api_key.strip()
        if self.llm_provider == "vllm":
            return not (self.vllm_base_url.strip() and self.vllm_model.strip())
        return True

    @property
    def fast_model(self) -> str:
        return {
            "anthropic": self.anthropic_fast_model,
            "openai": self.openai_fast_model,
            "vllm": self.vllm_model,
        }[self.llm_provider]

    @property
    def answer_model(self) -> str:
        return {
            "anthropic": self.anthropic_answer_model,
            "openai": self.openai_answer_model,
            "vllm": self.vllm_model,
        }[self.llm_provider]


settings = Settings()
