"""Health endpoint — also reports demo mode so the UI can warn the presenter."""

from __future__ import annotations

from fastapi import APIRouter

from backend.config import settings
from backend.models.schemas import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        version=settings.api_version,
        demo_mode=settings.demo_mode,
        answer_model=settings.answer_model,
        fast_model=settings.fast_model,
    )
