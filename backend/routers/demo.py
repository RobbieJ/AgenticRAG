import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from backend.models.schemas import DemoExecuteRequest
from backend.services.demo_orchestrator import DemoOrchestrator

router = APIRouter(prefix="/demo", tags=["demo"])
orchestrator = DemoOrchestrator()


@router.post("/execute")
async def execute_demo(request: DemoExecuteRequest):
    """Execute a demo and stream the results via Server-Sent Events (SSE)."""

    async def event_generator():
        try:
            async for event in orchestrator.execute_demo(
                request.demoType, request.query
            ):
                # Convert event to dict and serialize
                event_dict = event.model_dump()
                yield f"data: {json.dumps(event_dict)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.get("/examples")
async def get_example_queries():
    """Get example queries for the agentic loop demo."""
    return {
        "examples": [
            {
                "id": "ex_1",
                "query": "What is prompt engineering?",
                "topic": "prompt-engineering",
            },
            {
                "id": "ex_2",
                "query": "How does RAG work?",
                "topic": "rag",
            },
            {
                "id": "ex_3",
                "query": "What makes an AI system agentic?",
                "topic": "agentic-ai",
            },
            {
                "id": "ex_4",
                "query": "How can agentic RAG improve response quality?",
                "topic": "agentic-rag",
            },
            {
                "id": "ex_5",
                "query": "What are the key components of an agentic system?",
                "topic": "agentic-ai",
            },
        ]
    }


@router.get("/info/{demo_type}")
async def get_demo_info(demo_type: str):
    """Get information about a specific demo type."""
    demos = {
        "what-is-ai": {
            "title": "What is Agentic AI?",
            "description": "Understand the key components of agentic AI systems and how the PLAN→ACT→OBSERVE→REFLECT loop works.",
            "duration": "~2-3 minutes",
            "autoplay": True,
            "interactive": False,
        },
        "rag-comparison": {
            "title": "Classic RAG vs Agentic RAG",
            "description": "See the differences between traditional RAG and agentic RAG side-by-side. Understand why agentic RAG is more powerful.",
            "duration": "~1-2 minutes",
            "autoplay": True,
            "interactive": False,
        },
        "agentic-loop": {
            "title": "Agentic RAG Reasoning Loop",
            "description": "Watch the agentic RAG system execute in real-time. Enter a query and see it plan, retrieve, evaluate, generate, and refine.",
            "duration": "Variable (~30-90 seconds per query)",
            "autoplay": False,
            "interactive": True,
        },
    }

    if demo_type not in demos:
        raise HTTPException(status_code=404, detail="Demo type not found")

    return demos[demo_type]
