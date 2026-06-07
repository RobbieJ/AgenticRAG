"""Pydantic models for API requests and the streamed event protocol."""

from __future__ import annotations

from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel


class DemoType(str, Enum):
    WHAT_IS_AI = "what-is-ai"
    RAG_COMPARISON = "rag-comparison"
    AGENTIC_LOOP = "agentic-loop"


class DemoEvent(BaseModel):
    """A single step streamed to the frontend over SSE.

    ``highlight`` holds diagram node IDs that the frontend lights up — these match
    the IDs in the React diagram components, so the visual and the execution stay
    in lockstep.
    """

    step: int
    phase: str
    title: str
    description: str = ""
    code: Optional[str] = None
    highlight: List[str] = []
    documents: Optional[List[Dict]] = None
    score: Optional[float] = None
    reasoning: Optional[str] = None
    answer_delta: Optional[str] = None
    answer: Optional[str] = None
    iteration: Optional[int] = None
    done: bool = False


class HealthResponse(BaseModel):
    status: str
    version: str
    provider: str
    demo_mode: bool
    answer_model: str
    fast_model: str


class ExampleQueries(BaseModel):
    examples: List[str]
