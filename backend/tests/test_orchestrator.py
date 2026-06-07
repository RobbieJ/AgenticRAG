"""End-to-end demo execution in DEMO mode (no API key, no network)."""

import pytest

from backend.models.schemas import DemoType
from backend.services.demo_orchestrator import DemoOrchestrator


async def _collect(demo_type, query=None, mode="agentic"):
    orch = DemoOrchestrator()
    return [ev async for ev in orch.run(demo_type, query, mode)]


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
async def test_token_burn_accounting():
    events = await _collect(DemoType.AGENTIC_LOOP, "What is prompt engineering?")

    # Cumulative tokens are reported and never decrease.
    cums = [e.cumulative_tokens for e in events if e.cumulative_tokens is not None]
    assert cums and cums == sorted(cums)
    assert cums[-1] > 0

    # Per-step token attribution exists for LLM steps, tagged by iteration.
    iters = {e.iteration for e in events if e.tokens_in and e.iteration}
    assert len(iters) >= 1

    # The whole point: agentic RAG burns MORE than a classic single pass.
    final = events[-1]
    assert final.baseline_tokens and final.baseline_tokens > 0
    assert final.cumulative_tokens > final.baseline_tokens


@pytest.mark.asyncio
async def test_classic_mode_is_single_pass_and_cheaper():
    q = "What is prompt engineering?"
    classic = await _collect(DemoType.AGENTIC_LOOP, q, mode="classic")
    agentic = await _collect(DemoType.AGENTIC_LOOP, q, mode="agentic")

    phases = {e.phase for e in classic}
    assert "PLAN" not in phases and "EVALUATE" not in phases and "REFINE" not in phases
    assert classic[-1].phase == "COMPLETE" and classic[-1].done
    assert classic[-1].answer

    classic_total = classic[-1].cumulative_tokens
    agentic_total = agentic[-1].cumulative_tokens
    assert classic_total and classic_total > 0
    # The whole point of the comparison: classic burns fewer tokens.
    assert classic_total < agentic_total


@pytest.mark.asyncio
async def test_highlight_ids_are_known_nodes():
    events = await _collect(DemoType.AGENTIC_LOOP, "How does agentic RAG work?")
    known = {"query", "plan", "retrieve", "evaluate", "refine",
             "generate", "verify", "answer", "tools", "memory"}
    for e in events:
        for node in e.highlight:
            assert node in known, f"unknown highlight node: {node}"
