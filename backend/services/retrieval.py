"""In-process vector retrieval over the demo corpus.

This is a real, dependency-light retriever: documents and queries are turned into
TF-IDF vectors and ranked by cosine similarity. It needs no external service
(no Docker, no Weaviate), which keeps a live demo reliable while remaining a
genuine vector-space search — not a mock.

In production you would swap this class for a managed vector database; the
``retrieve`` interface is intentionally small so that swap is trivial.
"""

from __future__ import annotations

import math
import re
from typing import Dict, List

import numpy as np

from backend.models.demo_data import DEMO_DOCUMENTS

_TOKEN_RE = re.compile(r"[a-z0-9]+")

# Minimal stopword list — enough to stop common words from dominating cosine
# similarity on such a small corpus.
_STOPWORDS = {
    "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "is", "are",
    "was", "were", "be", "been", "it", "its", "this", "that", "these", "those",
    "as", "at", "by", "with", "from", "into", "about", "how", "what", "why",
    "does", "do", "can", "which", "when", "than", "then", "so", "if", "not",
}


def _tokenize(text: str) -> List[str]:
    return [t for t in _TOKEN_RE.findall(text.lower()) if t not in _STOPWORDS]


class InMemoryRetriever:
    """TF-IDF + cosine-similarity retriever over an in-memory document list."""

    def __init__(self, documents: List[Dict[str, str]]):
        self.documents = documents
        self._vocab: Dict[str, int] = {}
        self._idf: np.ndarray = np.zeros(0)
        self._matrix: np.ndarray = np.zeros((0, 0))
        self._build_index()

    def _build_index(self) -> None:
        tokenized = [_tokenize(f"{d['title']} {d['content']}") for d in self.documents]

        # Vocabulary.
        for tokens in tokenized:
            for tok in tokens:
                if tok not in self._vocab:
                    self._vocab[tok] = len(self._vocab)

        n_docs = len(self.documents)
        n_terms = len(self._vocab)

        # Document frequency -> smoothed IDF.
        df = np.zeros(n_terms)
        for tokens in tokenized:
            for tok in set(tokens):
                df[self._vocab[tok]] += 1
        self._idf = np.log((1 + n_docs) / (1 + df)) + 1.0

        # TF-IDF matrix (rows = documents), L2-normalized for cosine via dot product.
        matrix = np.zeros((n_docs, n_terms))
        for row, tokens in enumerate(tokenized):
            for tok in tokens:
                matrix[row, self._vocab[tok]] += 1.0
            matrix[row] *= self._idf
        self._matrix = self._l2_normalize(matrix)

    @staticmethod
    def _l2_normalize(matrix: np.ndarray) -> np.ndarray:
        norms = np.linalg.norm(matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return matrix / norms

    def _vectorize(self, text: str) -> np.ndarray:
        vec = np.zeros(len(self._vocab))
        for tok in _tokenize(text):
            idx = self._vocab.get(tok)
            if idx is not None:
                vec[idx] += 1.0
        vec *= self._idf
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec /= norm
        return vec

    def retrieve(self, query: str, top_k: int = 4) -> List[Dict]:
        """Return the top_k documents ranked by cosine similarity to the query."""
        if self._matrix.size == 0:
            return []
        query_vec = self._vectorize(query)
        scores = self._matrix @ query_vec  # cosine similarity (both normalized)
        order = np.argsort(scores)[::-1][:top_k]

        results: List[Dict] = []
        for rank, idx in enumerate(order, start=1):
            doc = self.documents[idx]
            results.append(
                {
                    "id": doc["id"],
                    "title": doc["title"],
                    "topic": doc["topic"],
                    "text": doc["content"],
                    "score": round(float(scores[idx]), 3),
                    "rank": rank,
                }
            )
        return results


# Module-level singleton — the index is tiny and built once at import.
retriever = InMemoryRetriever(DEMO_DOCUMENTS)
