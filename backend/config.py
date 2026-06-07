"""Application configuration.

Settings load from environment variables and an optional ``.env`` file. The app
is designed to run with zero external infrastructure: retrieval is in-process and
the only external dependency is the Anthropic API. When no API key is present the
app starts in DEMO mode and serves deterministic, illustrative responses so a
presenter can still drive the full UI offline.
"""

from __future__ import annotations

from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # --- API metadata ---
    api_title: str = "Agentic RAG Demo API"
    api_version: str = "1.0.0"
    debug: bool = False

    # --- Anthropic ---
    # Empty key => DEMO mode (no network calls; deterministic sample output).
    anthropic_api_key: str = ""
    # Small/fast model for plan + evaluate steps; capable model for synthesis.
    fast_model: str = "claude-haiku-4-5"
    answer_model: str = "claude-sonnet-4-6"

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
        """True when no Anthropic key is configured (offline-safe fallback)."""
        return not self.anthropic_api_key.strip()


settings = Settings()
