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

import sys
from pathlib import Path
from typing import List, Literal

from pydantic import ValidationError, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

Provider = Literal["anthropic", "openai", "vllm"]

_BACKEND_DIR = Path(__file__).resolve().parent
_REPO_ROOT = _BACKEND_DIR.parent


class Settings(BaseSettings):
    # Load env files by absolute path so it works regardless of the working
    # directory (you run `uvicorn backend.main:app` from the repo root). Both a
    # repo-root .env and backend/.env are honored; backend/.env wins if both set
    # the same key. Real environment variables always take precedence over files.
    model_config = SettingsConfigDict(
        env_file=(str(_REPO_ROOT / ".env"), str(_BACKEND_DIR / ".env")),
        env_file_encoding="utf-8",
        extra="ignore",
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

    @field_validator("evaluation_threshold")
    @classmethod
    def _check_threshold(cls, v: float) -> float:
        if not 0.0 <= v <= 1.0:
            raise ValueError("EVALUATION_THRESHOLD must be between 0.0 and 1.0")
        return v

    @field_validator("max_iterations")
    @classmethod
    def _check_iterations(cls, v: int) -> int:
        if v < 1:
            raise ValueError("MAX_ITERATIONS must be >= 1")
        return v

    @field_validator("retrieval_top_k")
    @classmethod
    def _check_top_k(cls, v: int) -> int:
        if v < 1:
            raise ValueError("RETRIEVAL_TOP_K must be >= 1")
        return v

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

    def startup_warnings(self) -> List[str]:
        """Non-fatal misconfiguration hints, logged at startup.

        These don't stop the app (it falls back to DEMO mode when credentials are
        missing) but flag likely setup mistakes so a presenter isn't surprised.
        """
        warnings: List[str] = []
        if self.llm_provider == "anthropic":
            key = self.anthropic_api_key.strip()
            if key and not key.startswith("sk-"):
                warnings.append(
                    "ANTHROPIC_API_KEY is set but doesn't start with 'sk-' — it may be invalid."
                )
        if self.llm_provider == "openai":
            key = self.openai_api_key.strip()
            if key and not key.startswith("sk-"):
                warnings.append(
                    "OPENAI_API_KEY is set but doesn't start with 'sk-' — it may be invalid."
                )
        if self.llm_provider == "vllm" and not self.demo_mode and not self.vllm_model.strip():
            warnings.append(
                "LLM_PROVIDER=vllm but VLLM_MODEL is empty — set it to the model "
                "name vLLM was started with."
            )
        return warnings


def _load_settings() -> Settings:
    """Instantiate settings, failing fast with a readable message on bad config."""
    try:
        return Settings()
    except ValidationError as exc:
        lines = [
            f"  - {'.'.join(str(p) for p in e['loc']) or 'config'}: {e['msg']}"
            for e in exc.errors()
        ]
        sys.stderr.write(
            "\n[config] Invalid configuration — fix these and restart:\n"
            + "\n".join(lines)
            + "\n\n"
        )
        raise SystemExit(1) from exc


settings = _load_settings()
