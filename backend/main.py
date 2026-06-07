"""FastAPI application entrypoint.

Run from the repository root:
    uvicorn backend.main:app --reload --port 8000
"""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.routers import demo, health

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agentic_rag")

app = FastAPI(title=settings.api_title, version=settings.api_version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(demo.router)


@app.on_event("startup")
async def _startup() -> None:
    mode = "DEMO (no API key — deterministic offline answers)" if settings.demo_mode else "LIVE"
    logger.info("Agentic RAG API starting in %s mode", mode)
    if not settings.demo_mode:
        logger.info("Models: answer=%s fast=%s", settings.answer_model, settings.fast_model)


@app.get("/")
async def root() -> dict:
    return {"name": settings.api_title, "version": settings.api_version, "docs": "/docs"}
