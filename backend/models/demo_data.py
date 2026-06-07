"""Sample knowledge base and example queries for the demos.

The corpus is intentionally small and self-contained so the demo runs offline and
retrieval results are easy to reason about during a live presentation.
"""

from __future__ import annotations

from typing import Dict, List

DEMO_DOCUMENTS: List[Dict[str, str]] = [
    {
        "id": "doc_prompt_basics",
        "title": "Introduction to Prompt Engineering",
        "topic": "Prompt Engineering",
        "content": (
            "Prompt engineering is the practice of designing effective instructions "
            "for large language models. A good prompt communicates intent clearly, "
            "supplies the context the model needs, and constrains the output format. "
            "Core techniques include being specific, giving examples, assigning a role, "
            "and iterating on wording. Well-crafted prompts substantially improve the "
            "relevance and reliability of model responses."
        ),
    },
    {
        "id": "doc_prompt_advanced",
        "title": "Advanced Prompt Engineering Techniques",
        "topic": "Prompt Engineering",
        "content": (
            "Advanced prompting goes beyond simple instructions. Chain-of-thought "
            "prompting asks the model to reason step by step. Few-shot prompting "
            "provides worked examples before the real question. Role prompting assigns "
            "a persona to steer tone and expertise. These techniques improve accuracy "
            "on multi-step reasoning, extraction, and classification tasks."
        ),
    },
    {
        "id": "doc_rag_fundamentals",
        "title": "Retrieval-Augmented Generation Fundamentals",
        "topic": "RAG",
        "content": (
            "Retrieval-Augmented Generation (RAG) combines information retrieval with "
            "language generation. First, relevant documents are retrieved from a "
            "knowledge base using semantic or keyword search. Then those documents are "
            "supplied as context so the model can generate a grounded, citable answer. "
            "RAG is the standard way to ground answers in private or up-to-date data "
            "without retraining the model."
        ),
    },
    {
        "id": "doc_rag_architecture",
        "title": "RAG System Architecture",
        "topic": "RAG",
        "content": (
            "A RAG system has several components: a document collection, an embedding "
            "or indexing model, a vector or keyword index for similarity search, a "
            "retriever that fetches the top matching chunks, and a language model that "
            "generates the final answer. Documents are typically chunked and indexed "
            "ahead of time. Quality depends on chunking strategy, retrieval recall, "
            "and how well the prompt instructs the model to stay grounded in context."
        ),
    },
    {
        "id": "doc_classic_rag_limits",
        "title": "Limitations of Classic RAG",
        "topic": "RAG",
        "content": (
            "Classic RAG runs a single retrieval pass: embed the query, search once, "
            "and generate. If that one search misses, there is no recovery — the model "
            "answers from weak context or hallucinates. Classic RAG does not reason "
            "about whether the retrieved context is sufficient, cannot reformulate the "
            "query, and uses a single source. It struggles with multi-hop questions "
            "that require combining several retrievals."
        ),
    },
    {
        "id": "doc_agentic_ai",
        "title": "What is Agentic AI?",
        "topic": "Agentic AI",
        "content": (
            "Agentic AI describes systems where a language model does more than answer: "
            "it sets goals, plans, takes actions using tools, observes the results, and "
            "self-corrects in a loop. The key capabilities are planning, tool use, "
            "memory, reflection, and autonomy. Instead of a single forward pass, an "
            "agent runs a plan-act-observe-reflect cycle until the goal is met."
        ),
    },
    {
        "id": "doc_agentic_rag",
        "title": "Agentic RAG: Retrieval as a Control Loop",
        "topic": "Agentic RAG",
        "content": (
            "Agentic RAG turns retrieval into a reasoning control loop. The agent plans "
            "the approach, retrieves from a chosen source, evaluates whether the "
            "evidence is relevant and sufficient, and either refines its query and "
            "retrieves again or synthesizes a verified answer with citations. Because it "
            "evaluates and can retry, agentic RAG is self-correcting rather than "
            "one-shot, which makes it far more robust on hard or ambiguous questions."
        ),
    },
    {
        "id": "doc_agent_planning",
        "title": "Planning in Agentic Systems",
        "topic": "Agentic AI",
        "content": (
            "The planning step decomposes an ambiguous goal into concrete actions. In "
            "agentic RAG, planning means analyzing the question, deciding what "
            "information is needed, and rewriting the query for better retrieval. Good "
            "planning reduces wasted retrieval calls and anticipates information gaps "
            "before they cause a poor answer."
        ),
    },
    {
        "id": "doc_agent_tools",
        "title": "Tool Use in Agentic Systems",
        "topic": "Agentic AI",
        "content": (
            "Tool use lets an agent act on the world: querying a vector store, running "
            "a keyword or web search, calling a SQL database, or hitting an external "
            "API. An effective agent chooses the right tool for each sub-task, composes "
            "tools into workflows, and handles failures gracefully rather than giving "
            "up on the first error."
        ),
    },
    {
        "id": "doc_agent_reflection",
        "title": "Reflection and Self-Correction",
        "topic": "Agentic AI",
        "content": (
            "Reflection is an agent evaluating its own output. In RAG, reflection asks "
            "whether the retrieved documents actually answer the question and whether "
            "the drafted answer is supported by evidence. If confidence is low, the "
            "agent self-corrects: it rewrites the query, switches sources, or retrieves "
            "again. Reflection and self-correction are what make agentic systems "
            "reliable without a human in the loop."
        ),
    },
]

EXAMPLE_QUERIES: List[str] = [
    "What is prompt engineering?",
    "How does agentic RAG differ from classic RAG?",
    "What makes an AI system agentic?",
    "Why does classic RAG fail on hard questions?",
    "What are the key components of an agentic system?",
]
