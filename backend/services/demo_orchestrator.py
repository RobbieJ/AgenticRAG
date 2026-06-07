"""Drives the three demos and emits diagram-synced events.

Each ``DemoEvent`` carries ``highlight`` node IDs that exactly match the IDs used
by the React diagram components, so the on-screen flow diagram animates in lockstep
with the executing code.

  - what-is-ai     : scripted PLAN -> ACT -> OBSERVE -> REFLECT loop (no LLM)
  - rag-comparison : scripted classic vs agentic walkthrough (no LLM)
  - agentic-loop   : the real loop — retrieve + Claude plan/evaluate/generate
"""

from __future__ import annotations

import asyncio
from typing import AsyncGenerator, Optional

from backend.config import settings
from backend.models.schemas import DemoEvent, DemoType
from backend.services.llm import get_llm_service
from backend.services.retrieval import retriever

# Pacing between scripted steps so a presenter can narrate.
STEP_PAUSE = 1.4


class DemoOrchestrator:
    def __init__(self) -> None:
        self.llm = get_llm_service()

    async def run(
        self, demo_type: DemoType, query: Optional[str] = None
    ) -> AsyncGenerator[DemoEvent, None]:
        if demo_type == DemoType.WHAT_IS_AI:
            async for ev in self._what_is_ai():
                yield ev
        elif demo_type == DemoType.RAG_COMPARISON:
            async for ev in self._rag_comparison():
                yield ev
        else:
            async for ev in self._agentic_loop(query or "What is agentic RAG?"):
                yield ev

    # ----------------------------------------------------------- DEMO 1
    async def _what_is_ai(self) -> AsyncGenerator[DemoEvent, None]:
        steps = [
            ("PLAN", "Plan", "Break the ambiguous goal into concrete steps.",
             "plan = agent.decompose(goal)", ["agent", "planning", "plan"]),
            ("ACT", "Act", "Take an action using a tool.",
             "result = agent.use_tool(step)", ["agent", "tooluse", "act"]),
            ("OBSERVE", "Observe", "Observe the result and update memory.",
             "memory.record(result)", ["agent", "memory", "observe"]),
            ("REFLECT", "Reflect", "Critique the outcome and decide whether to continue.",
             "if not agent.satisfied(): continue", ["agent", "reflection", "reflect"]),
        ]
        for i, (phase, title, desc, code, highlight) in enumerate(steps, start=1):
            yield DemoEvent(step=i, phase=phase, title=title, description=desc,
                            code=code, highlight=highlight)
            await asyncio.sleep(STEP_PAUSE)

        yield DemoEvent(
            step=5, phase="LOOP", title="The agentic loop",
            description="Autonomy ties it together: the agent repeats plan -> act -> observe -> reflect until confident.",
            code="while not goal_achieved():\n    plan(); act(); observe(); reflect()",
            highlight=["agent", "autonomy", "plan", "act", "observe", "reflect"],
            done=True,
        )

    # ----------------------------------------------------------- DEMO 2
    async def _rag_comparison(self) -> AsyncGenerator[DemoEvent, None]:
        classic = [
            ("Query", "User asks a question.", "query = user_input()", ["c_query"]),
            ("Embed", "Embed the query into a vector.", "v = embed(query)", ["c_embed"]),
            ("Search (once)", "Single vector-search pass — no retry.",
             "chunks = index.search(v, k=4)", ["c_search"]),
            ("Top-k chunks", "Whatever came back is all the context there is.",
             "context = chunks", ["c_chunks"]),
            ("Generate", "Generate an answer from that single context.",
             "answer = llm(context, query)", ["c_generate"]),
            ("Answer", "Return the answer. If retrieval missed, so does the answer.",
             "return answer", ["c_answer"]),
        ]
        for i, (title, desc, code, highlight) in enumerate(classic, start=1):
            yield DemoEvent(step=i, phase="CLASSIC", title=f"Classic RAG · {title}",
                            description=desc, code=code, highlight=highlight)
            await asyncio.sleep(STEP_PAUSE)

        agentic = [
            ("Query", "User asks a question.", "query = user_input()", ["a_query"]),
            ("Plan", "The agent plans an approach and rewrites the query.",
             "plan = agent.plan(query)", ["a_plan"]),
            ("Retrieve", "Retrieve from a chosen tool/source.",
             "docs = agent.retrieve(plan)", ["a_retrieve", "a_tools"]),
            ("Evaluate -> decide", "Is the evidence enough? Retrieve again or proceed.",
             "if score < 0.7: retrieve_again()", ["a_decision"]),
            ("Generate + verify", "Synthesize a grounded answer and verify it.",
             "answer = agent.generate(docs)", ["a_generate"]),
            ("Answer + citations", "Self-correcting, not one-shot.",
             "return answer, citations", ["a_answer"]),
        ]
        for j, (title, desc, code, highlight) in enumerate(agentic, start=7):
            yield DemoEvent(step=j, phase="AGENTIC", title=f"Agentic RAG · {title}",
                            description=desc, code=code, highlight=highlight)
            await asyncio.sleep(STEP_PAUSE)

        yield DemoEvent(
            step=13, phase="SUMMARY", title="Why agentic RAG wins",
            description="Classic RAG retrieves once and hopes. Agentic RAG evaluates its "
                        "evidence and retries until confident — robust on hard questions.",
            highlight=["a_decision"], done=True,
        )

    # ----------------------------------------------------------- DEMO 3 (real)
    async def _agentic_loop(self, query: str) -> AsyncGenerator[DemoEvent, None]:
        step = 0
        feedback: Optional[str] = None
        documents: list = []

        yield DemoEvent(step=(step := step + 1), phase="QUERY", title="User query",
                        description=query, highlight=["query"])
        await asyncio.sleep(0.6)

        for iteration in range(1, settings.max_iterations + 1):
            # PLAN
            rewritten = await self.llm.plan(query, feedback)
            yield DemoEvent(
                step=(step := step + 1), phase="PLAN", title="Plan",
                description=f"Rewrote the query for retrieval: “{rewritten}”",
                code=f'rewritten = llm.plan(query{", feedback" if feedback else ""})',
                highlight=["plan"], iteration=iteration,
            )
            await asyncio.sleep(0.5)

            # RETRIEVE
            documents = retriever.retrieve(rewritten, top_k=settings.retrieval_top_k)
            yield DemoEvent(
                step=(step := step + 1), phase="RETRIEVE", title="Retrieve",
                description=f"Vector search returned {len(documents)} documents.",
                code="docs = retriever.retrieve(rewritten, top_k=4)",
                highlight=["retrieve", "tools"],
                documents=[{"id": d["id"], "title": d["title"], "score": d["score"]} for d in documents],
                iteration=iteration,
            )
            await asyncio.sleep(0.5)

            # EVALUATE
            verdict = await self.llm.evaluate(query, documents)
            yield DemoEvent(
                step=(step := step + 1), phase="EVALUATE", title="Evaluate",
                description="Is the evidence relevant and sufficient?",
                code="verdict = llm.evaluate(query, docs)",
                highlight=["evaluate"], score=verdict["score"],
                reasoning=verdict["reasoning"], iteration=iteration,
            )
            await asyncio.sleep(0.5)

            if verdict["sufficient"] or iteration == settings.max_iterations:
                break

            # REFINE -> loop
            feedback = verdict["reasoning"]
            yield DemoEvent(
                step=(step := step + 1), phase="REFINE", title="Refine",
                description=f"Confidence {verdict['score']:.2f} < {settings.evaluation_threshold}. "
                            f"Refining the query and retrieving again.",
                code="feedback = verdict.reasoning  # loop back to PLAN",
                highlight=["refine"], iteration=iteration,
            )
            await asyncio.sleep(0.6)

        # GENERATE (streamed)
        gen_step = (step := step + 1)
        yield DemoEvent(
            step=gen_step, phase="GENERATE", title="Generate",
            description="Synthesizing a grounded answer from the evidence.",
            code="for chunk in llm.generate(query, docs): ...",
            highlight=["generate"], answer="",
        )
        full = ""
        async for chunk in self.llm.generate(query, documents):
            full += chunk
            yield DemoEvent(step=gen_step, phase="GENERATE", title="Generate",
                            highlight=["generate"], answer_delta=chunk)

        # VERIFY
        yield DemoEvent(
            step=(step := step + 1), phase="VERIFY", title="Verify",
            description="Answer checked against retrieved evidence before returning.",
            code="assert grounded_in(answer, docs)", highlight=["verify"],
        )
        await asyncio.sleep(0.5)

        # COMPLETE
        yield DemoEvent(
            step=(step := step + 1), phase="COMPLETE", title="Answer + citations",
            description="High confidence with citations — loop stops.",
            highlight=["answer"], answer=full,
            documents=[{"id": d["id"], "title": d["title"], "score": d["score"]} for d in documents],
            done=True,
        )
