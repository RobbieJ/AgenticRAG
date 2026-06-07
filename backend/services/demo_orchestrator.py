import asyncio
from typing import AsyncGenerator
from backend.models.schemas import DemoEvent, DemoTypeEnum
from backend.services.rag_pipeline import RAGPipeline
from backend.services.claude_integration import ClaudeIntegration


class DemoOrchestrator:
    def __init__(self):
        self.rag_pipeline = RAGPipeline()
        self.claude = ClaudeIntegration()

    async def execute_demo(
        self, demo_type: DemoTypeEnum, query: str = None
    ) -> AsyncGenerator[DemoEvent, None]:
        """Execute the appropriate demo based on type."""
        if demo_type == DemoTypeEnum.WHAT_IS_AI:
            async for event in self._demo_what_is_ai():
                yield event
        elif demo_type == DemoTypeEnum.RAG_COMPARISON:
            async for event in self._demo_rag_comparison():
                yield event
        elif demo_type == DemoTypeEnum.AGENTIC_LOOP:
            if not query:
                query = "What is prompt engineering?"
            async for event in self.rag_pipeline.execute_agentic_rag(query):
                yield event

    async def _demo_what_is_ai(self) -> AsyncGenerator[DemoEvent, None]:
        """Demo: What is Agentic AI - shows the loop components."""
        steps = [
            (
                1,
                "PLAN",
                "Analyzing the task and planning the approach",
                "def plan(goal):\n    return break_into_steps(goal)",
                ["planning_box"],
            ),
            (
                2,
                "ACT",
                "Executing actions based on the plan",
                "def act(step):\n    return execute_tool(step)",
                ["act_box", "tool_use_box"],
            ),
            (
                3,
                "OBSERVE",
                "Observing the results and environment feedback",
                "def observe():\n    return check_results()",
                ["observe_box", "memory_box"],
            ),
            (
                4,
                "REFLECT",
                "Reflecting on outcomes and self-correcting",
                "def reflect(result):\n    return evaluate_quality(result)",
                ["reflect_box"],
            ),
        ]

        for step_num, name, desc, code, highlights in steps:
            yield DemoEvent(
                step=step_num,
                name=name,
                description=desc,
                codeBlock=code,
                highlightDiagram=highlights,
                executionTime=1.5,
            )
            await asyncio.sleep(2)

        # Show the loop
        yield DemoEvent(
            step=5,
            name="LOOP",
            description="The agentic loop continues until the goal is achieved",
            codeBlock="while not goal_achieved():\n    plan() → act() → observe() → reflect()",
            highlightDiagram=["planning_box", "act_box", "observe_box", "reflect_box"],
            executionTime=1.0,
        )

    async def _demo_rag_comparison(self) -> AsyncGenerator[DemoEvent, None]:
        """Demo: Classic RAG vs Agentic RAG - shows the differences."""
        # Classic RAG side
        classic_steps = [
            (
                1,
                "CLASSIC_QUERY",
                "Classic RAG: User enters query",
                "query = user_input()",
                ["classic_query_box"],
            ),
            (
                2,
                "CLASSIC_RETRIEVE",
                "Classic RAG: Single retrieval pass",
                "docs = vector_db.search(query)",
                ["classic_retrieve_box"],
            ),
            (
                3,
                "CLASSIC_GENERATE",
                "Classic RAG: Generate answer",
                "answer = llm.generate(docs, query)",
                ["classic_generate_box"],
            ),
        ]

        for step_num, name, desc, code, highlights in classic_steps:
            yield DemoEvent(
                step=step_num,
                name=name,
                description=desc,
                codeBlock=code,
                highlightDiagram=highlights,
                executionTime=1.2,
            )
            await asyncio.sleep(2)

        # Comparison
        yield DemoEvent(
            step=4,
            name="COMPARISON",
            description="Classic RAG retrieves once. If it misses, there's no recovery.",
            codeBlock="# No refinement or loop\nreturn answer",
            highlightDiagram=[],
            executionTime=1.0,
        )
        await asyncio.sleep(2)

        # Agentic RAG side
        agentic_steps = [
            (
                5,
                "AGENTIC_QUERY",
                "Agentic RAG: User enters query",
                "query = user_input()",
                ["agentic_query_box"],
            ),
            (
                6,
                "AGENTIC_PLAN",
                "Agentic RAG: Plan the retrieval strategy",
                "plan = llm.plan_retrieval(query)",
                ["agentic_plan_box"],
            ),
            (
                7,
                "AGENTIC_RETRIEVE",
                "Agentic RAG: Retrieve based on plan",
                "docs = vector_db.search(rewritten_query)",
                ["agentic_retrieve_box"],
            ),
            (
                8,
                "AGENTIC_EVALUATE",
                "Agentic RAG: Evaluate retrieved documents",
                "score = llm.evaluate(docs, query)",
                ["agentic_evaluate_box"],
            ),
            (
                9,
                "AGENTIC_DECISION",
                "Agentic RAG: Decide - retrieve more or generate?",
                "if score < threshold: retrieve_again()\nelse: generate()",
                ["agentic_evaluate_box"],
            ),
            (
                10,
                "AGENTIC_GENERATE",
                "Agentic RAG: Generate final answer",
                "answer = llm.generate(docs, query)",
                ["agentic_generate_box"],
            ),
        ]

        for step_num, name, desc, code, highlights in agentic_steps:
            yield DemoEvent(
                step=step_num,
                name=name,
                description=desc,
                codeBlock=code,
                highlightDiagram=highlights,
                executionTime=1.2,
            )
            await asyncio.sleep(2)

        # Final comparison
        yield DemoEvent(
            step=11,
            name="ADVANTAGE",
            description="Agentic RAG adapts and refines until confident. Self-correcting!",
            codeBlock="# Evaluates quality and loops if needed\nfor i in range(max_iterations):\n    retrieve() → evaluate() → if confident: break",
            highlightDiagram=[],
            executionTime=1.0,
        )
