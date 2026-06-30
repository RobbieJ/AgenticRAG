"""Demo endpoints. The execute endpoint streams Server-Sent Events.

It is a GET (not POST) because the browser's EventSource API only issues GET
requests — the frontend opens ``new EventSource('/demo/stream?...')``.
"""

from __future__ import annotations

import asyncio
import json
from typing import Literal, Optional

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from backend.models.demo_data import EXAMPLE_QUERIES
from backend.models.schemas import DemoType, ExampleQueries
from backend.services.demo_orchestrator import DemoOrchestrator
from backend.utils.text import MAX_QUERY_LEN, sanitize_query

router = APIRouter(prefix="/demo", tags=["demo"])
orchestrator = DemoOrchestrator()


@router.get("/stream")
async def stream_demo(
    demoType: DemoType = Query(...),
    query: Optional[str] = Query(None, max_length=MAX_QUERY_LEN),
    # Literal makes FastAPI reject anything other than these with a 422.
    mode: Literal["agentic", "classic"] = Query("agentic"),
):
    safe_query = sanitize_query(query)

    async def event_generator():
        try:
            async for event in orchestrator.run(demoType, safe_query, mode):
                # exclude_none so partial events (e.g. trailing token-only updates)
                # merge cleanly on the client without nulling existing step fields.
                yield f"data: {event.model_dump_json(exclude_none=True)}\n\n"
            yield "event: end\ndata: {}\n\n"
        except asyncio.CancelledError:  # client disconnected
            raise
        except Exception as exc:  # surface errors to the client as a typed event
            payload = json.dumps({"phase": "ERROR", "title": "Error", "description": str(exc)})
            yield f"data: {payload}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/examples", response_model=ExampleQueries)
async def examples() -> ExampleQueries:
    return ExampleQueries(examples=EXAMPLE_QUERIES)
