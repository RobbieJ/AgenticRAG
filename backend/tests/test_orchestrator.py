"""End-to-end demo execution in DEMO mode (no API key, no network)."""

import pytest

from backend.models.schemas import DemoType
from backend.services.demo_orchestrator import DemoOrchestrator


async def _collect(demo_type, query=None):
    orch = DemoOrchestrator()
    return [ev async for ev in orch.run(demo_type, query)]


@pytest.mark.asyncio
async def test_what_is_ai_emits_loop_steps():
    events = await _collect(DemoType.WHAT_IS_AI)
    phases = [e.phase for e in events]
    assert phases[:4] == ["PLAN", "ACT", "OBSERVE", "REFLECT"]
    assert events[-1].done is True


@pytest.mark.asyncio
async def test_rag_comparison_covers_both_sides():
    events = await _collect(DemoType.RAG_COMPARISON)
    phases = {e.phase for e in events}
    assert "CLASSIC" in phases and "AGENTIC" in phases
    assert events[-1].done is True


@pytest.mark.asyncio
async def test_agentic_loop_runs_and_produces_grounded_answer():
    events = await _collect(DemoType.AGENTIC_LOOP, "What is prompt engineering?")
    phases = [e.phase for e in events]
    assert "PLAN" in phases and "RETRIEVE" in phases and "EVALUATE" in phases
    assert "GENERATE" in phases

    final = events[-1]
    assert final.phase == "COMPLETE" and final.done is True
    assert final.answer  # non-empty grounded answer
    assert final.documents  # citations present

    # Diagram highlight IDs must be present so the UI can animate.
    assert any(e.highlight for e in events)


@pytest.mark.asyncio
async def test_highlight_ids_are_known_nodes():
    events = await _collect(DemoType.AGENTIC_LOOP, "How does agentic RAG work?")
    known = {"query", "plan", "retrieve", "evaluate", "refine",
             "generate", "verify", "answer", "tools", "memory"}
    for e in events:
        for node in e.highlight:
            assert node in known, f"unknown highlight node: {node}"
