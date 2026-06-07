import time
from typing import AsyncGenerator, Dict, List
from backend.services.claude_integration import ClaudeIntegration
from backend.services.vector_store import WeaviateVectorStore
from backend.models.schemas import DemoEvent


class RAGPipeline:
    def __init__(self):
        self.claude = ClaudeIntegration()
        self.vector_store = WeaviateVectorStore()
        self.max_iterations = 5
        self.evaluation_threshold = 0.7

    async def execute_agentic_rag(
        self, query: str
    ) -> AsyncGenerator[DemoEvent, None]:
        """Execute the agentic RAG loop for a given query."""
        iteration = 0
        current_query = query
        conversation_history = []

        while iteration < self.max_iterations:
            iteration += 1

            # Step 1: PLAN
            yield await self._plan_step(current_query, iteration)
            await asyncio._sleep(0.5)

            # Rewrite query for better retrieval
            rewritten_query = await self.claude.rewrite_query(current_query)

            # Step 2: RETRIEVE
            retrieve_event = await self._retrieve_step(rewritten_query)
            yield retrieve_event
            await asyncio._sleep(0.5)
            retrieved_docs = retrieve_event.results

            # Step 3: EVALUATE
            evaluate_event = await self._evaluate_step(
                retrieved_docs, current_query, iteration
            )
            yield evaluate_event
            await asyncio._sleep(0.5)

            evaluation_score = evaluate_event.score
            should_refine = evaluation_score < self.evaluation_threshold

            if not should_refine:
                # Step 4: GENERATE
                context = "\n---\n".join(
                    [f"{doc['title']}\n{doc['text']}" for doc in retrieved_docs]
                )
                yield await self._generate_step(context, current_query)
                await asyncio._sleep(0.5)

                # Step 5: COMPLETE
                yield await self._complete_step(
                    retrieved_docs, iteration, evaluation_score
                )
                break
            else:
                # Step 5: REFINE and loop
                if iteration < self.max_iterations:
                    yield await self._refine_step(
                        current_query, evaluation_score, iteration
                    )
                    # Prepare for next iteration
                    current_query = f"{query} (refined attempt {iteration})"
                else:
                    # Max iterations reached, generate answer anyway
                    context = "\n---\n".join(
                        [f"{doc['title']}\n{doc['text']}" for doc in retrieved_docs]
                    )
                    yield await self._generate_step(context, current_query)
                    await asyncio._sleep(0.5)
                    yield await self._complete_step(
                        retrieved_docs, iteration, evaluation_score
                    )
                    break

    async def _plan_step(self, query: str, iteration: int) -> DemoEvent:
        """Execute the PLAN step."""
        step_num = (iteration - 1) * 5 + 1
        return DemoEvent(
            step=step_num,
            name="PLAN",
            description=f"Analyzing query and planning retrieval strategy (iteration {iteration})",
            codeBlock=(
                'rewritten_query = claude.rewrite_query('
                f'"{query[:50]}...")'
            ),
            highlightDiagram=["planning_box"],
            executionTime=0.8,
        )

    async def _retrieve_step(self, query: str) -> DemoEvent:
        """Execute the RETRIEVE step."""
        start_time = time.time()
        retrieved_docs = await self.vector_store.retrieve(query, top_k=5)
        execution_time = time.time() - start_time

        results = [
            {
                "id": doc["id"],
                "title": doc["title"],
                "score": round(doc.get("score", 0), 3),
            }
            for doc in retrieved_docs
        ]

        return DemoEvent(
            step=2,
            name="RETRIEVE",
            description="Searching knowledge base for relevant documents",
            codeBlock="docs = vector_store.retrieve(query, top_k=5)",
            results=results,
            highlightDiagram=["retrieve_box"],
            executionTime=execution_time,
        )

    async def _evaluate_step(
        self, documents: List[Dict], query: str, iteration: int
    ) -> DemoEvent:
        """Execute the EVALUATE step."""
        start_time = time.time()
        score = await self.claude.evaluate_relevance(documents, query)
        execution_time = time.time() - start_time

        reasoning = (
            "Documents directly address the query"
            if score >= 0.7
            else "Documents provide partial information, may need refinement"
        )

        return DemoEvent(
            step=3,
            name="EVALUATE",
            description="Assessing relevance of retrieved documents",
            codeBlock="score = evaluator.score(docs, query)",
            score=round(score, 3),
            reasoning=reasoning,
            highlightDiagram=["evaluate_box"],
            executionTime=execution_time,
        )

    async def _generate_step(self, context: str, query: str) -> DemoEvent:
        """Execute the GENERATE step."""
        start_time = time.time()

        # For demo purposes, generate a short response
        response = await self.claude.generate_answer(context, query, stream=False)
        execution_time = time.time() - start_time

        return DemoEvent(
            step=4,
            name="GENERATE",
            description="Creating answer from retrieved context",
            codeBlock="response = claude.generate(context=docs, query=query)",
            response=response[:500] + "..." if len(response) > 500 else response,
            highlightDiagram=["generate_box"],
            executionTime=execution_time,
        )

    async def _refine_step(
        self, query: str, score: float, iteration: int
    ) -> DemoEvent:
        """Execute the REFINE step."""
        return DemoEvent(
            step=5,
            name="REFINE",
            description=(
                f"Quality score {score:.2f} below threshold {self.evaluation_threshold}. "
                f"Refining and retrying..."
            ),
            codeBlock=(
                f"if score < {self.evaluation_threshold}: "
                "rewrite_query_and_retry()"
            ),
            looping=True,
            highlightDiagram=["refine_box"],
            executionTime=0.5,
        )

    async def _complete_step(
        self, documents: List[Dict], iteration: int, score: float
    ) -> DemoEvent:
        """Execute the COMPLETE step."""
        return DemoEvent(
            step=5,
            name="COMPLETE",
            decision=(
                f"Score {score:.2f} >= threshold {self.evaluation_threshold} "
                f"(iteration {iteration}/{self.max_iterations})"
            ),
            finalResult={
                "iterations": iteration,
                "confidence_score": round(score, 3),
                "source_documents": [doc["title"] for doc in documents],
            },
        )


# Import asyncio for the sleep function
import asyncio

# Monkey-patch the asyncio sleep in the module
asyncio._sleep = asyncio.sleep
