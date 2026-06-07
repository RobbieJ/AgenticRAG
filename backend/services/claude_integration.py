import json
from anthropic import Anthropic, AsyncAnthropic
from typing import Optional, AsyncGenerator
from backend.config import settings


class ClaudeIntegration:
    def __init__(self):
        self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.async_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.ANTHROPIC_MODEL

    async def rewrite_query(self, query: str) -> str:
        """Rewrite a query for better semantic search (PLAN step)."""
        message = self.client.messages.create(
            model=self.model,
            max_tokens=150,
            messages=[
                {
                    "role": "user",
                    "content": f"Rewrite this query to be more specific for document retrieval, focusing on key concepts: '{query}'\n\nReturn only the rewritten query, nothing else.",
                }
            ],
        )
        return message.content[0].text.strip()

    async def evaluate_relevance(self, documents: list, query: str) -> float:
        """Evaluate if documents are relevant to the query (EVALUATE step)."""
        doc_summaries = "\n".join(
            [f"- {doc.get('title', 'Unknown')}: {doc.get('text', '')[:200]}"
             for doc in documents[:3]]
        )

        message = self.client.messages.create(
            model=self.model,
            max_tokens=50,
            messages=[
                {
                    "role": "user",
                    "content": f"Rate how well these documents answer the query '{query}'.\n\nDocuments:\n{doc_summaries}\n\nProvide only a number between 0 and 1 (e.g., 0.85).",
                }
            ],
        )

        try:
            score = float(message.content[0].text.strip())
            return min(1.0, max(0.0, score))
        except (ValueError, AttributeError):
            return 0.5

    async def generate_answer(
        self, context: str, query: str, stream: bool = False
    ) -> str | AsyncGenerator[str, None]:
        """Generate an answer based on context (GENERATE step)."""
        system_prompt = "You are a helpful assistant. Answer the question based solely on the provided context. If the context doesn't contain relevant information, say so clearly."

        if stream:
            return self._generate_streaming(system_prompt, context, query)
        else:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=500,
                system=system_prompt,
                messages=[
                    {
                        "role": "user",
                        "content": f"Context:\n{context}\n\nQuestion: {query}",
                    }
                ],
            )
            return message.content[0].text

    async def _generate_streaming(
        self, system: str, context: str, query: str
    ) -> AsyncGenerator[str, None]:
        """Stream the generation response."""
        with self.client.messages.stream(
            model=self.model,
            max_tokens=500,
            system=system,
            messages=[
                {
                    "role": "user",
                    "content": f"Context:\n{context}\n\nQuestion: {query}",
                }
            ],
        ) as stream:
            for text in stream.text_stream:
                yield text

    async def generate_explanation(self, step_name: str) -> str:
        """Generate an explanation for a demo step."""
        step_explanations = {
            "PLAN": "Planning involves analyzing the user's query and determining the best retrieval strategy. We rewrite the query to be more specific and retrieve relevant documents.",
            "RETRIEVE": "Retrieval searches the knowledge base for documents that might answer the query using semantic similarity.",
            "EVALUATE": "Evaluation assesses whether the retrieved documents have enough relevant information to answer the query.",
            "GENERATE": "Generation creates a comprehensive answer based on the retrieved context.",
            "REFINE": "If the evaluation score is low, we refine the query and loop back to retrieval for better results.",
        }
        return step_explanations.get(step_name, "")
