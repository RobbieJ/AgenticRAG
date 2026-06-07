"""The retriever must return genuinely relevant documents — not random ones."""

from backend.services.retrieval import retriever


def test_prompt_engineering_query_ranks_prompt_docs_first():
    results = retriever.retrieve("What is prompt engineering?", top_k=3)
    assert results, "expected non-empty results"
    assert results[0]["topic"] == "Prompt Engineering"
    assert results[0]["score"] > 0


def test_agentic_query_ranks_agentic_docs_first():
    results = retriever.retrieve("what makes an AI system agentic?", top_k=3)
    assert results[0]["topic"] in {"Agentic AI", "Agentic RAG"}


def test_scores_are_sorted_descending():
    results = retriever.retrieve("retrieval augmented generation", top_k=5)
    scores = [r["score"] for r in results]
    assert scores == sorted(scores, reverse=True)


def test_unrelated_query_scores_low():
    results = retriever.retrieve("bananas pancakes weather", top_k=1)
    # No corpus term overlap -> near-zero cosine similarity.
    assert results[0]["score"] < 0.2
