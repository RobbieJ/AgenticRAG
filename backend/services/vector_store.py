import weaviate
from typing import List, Optional, Dict
from backend.config import settings
from backend.models.schemas import DocumentModel
import time


class WeaviateVectorStore:
    def __init__(self):
        """Initialize Weaviate connection."""
        self.client = weaviate.Client(
            url=settings.WEAVIATE_URL,
            auth_client_secret=weaviate.AuthApiKey(
                api_key=settings.WEAVIATE_API_KEY
            )
            if settings.WEAVIATE_API_KEY
            else None,
        )
        self._ensure_schema()
        self._initialize_demo_data()

    def _ensure_schema(self):
        """Ensure the Document class schema exists in Weaviate."""
        schema = {
            "classes": [
                {
                    "class": "Document",
                    "description": "A document in the knowledge base",
                    "vectorizer": "none",
                    "properties": [
                        {
                            "name": "title",
                            "description": "Document title",
                            "dataType": ["text"],
                        },
                        {
                            "name": "content",
                            "description": "Document content",
                            "dataType": ["text"],
                        },
                        {
                            "name": "topic",
                            "description": "Document topic",
                            "dataType": ["text"],
                        },
                    ],
                }
            ]
        }

        # Check if schema already exists
        existing_schema = self.client.schema.get()
        class_names = [cls["class"] for cls in existing_schema.get("classes", [])]

        if "Document" not in class_names:
            self.client.schema.create(schema)

    def _initialize_demo_data(self):
        """Initialize demo documents."""
        from backend.models.demo_data import DEMO_DOCUMENTS

        existing = self.client.query.aggregate("Document").with_meta().do()
        doc_count = existing["data"]["Aggregate"]["Document"][0]["meta"]["count"]

        if doc_count == 0:
            for doc_id, doc_data in DEMO_DOCUMENTS.items():
                self._add_document(
                    doc_id, doc_data["title"], doc_data["content"], doc_data["topic"]
                )

    def _add_document(
        self, doc_id: str, title: str, content: str, topic: str
    ):
        """Add a document to Weaviate."""
        # For simplicity, we'll use a basic embedding hash
        # In production, you'd use Claude embeddings
        embedding = self._simple_embedding(content)

        self.client.data_object.create(
            data_object={
                "title": title,
                "content": content,
                "topic": topic,
            },
            class_name="Document",
            uuid=doc_id,
            vector=embedding,
        )

    def _simple_embedding(self, text: str) -> List[float]:
        """Create a simple embedding for demo purposes."""
        # This is a placeholder - in production, use Claude embeddings
        import hashlib

        hash_val = hashlib.md5(text.encode()).hexdigest()
        values = [int(h, 16) / 255.0 for h in hash_val]

        # Pad to 384 dimensions
        while len(values) < 384:
            values.append(sum(values) / len(values) if values else 0.5)

        return values[:384]

    async def retrieve(
        self, query: str, top_k: int = 5
    ) -> List[Dict]:
        """Retrieve documents similar to the query."""
        query_embedding = self._simple_embedding(query)

        result = (
            self.client.query.get("Document")
            .with_near_vector({"vector": query_embedding})
            .with_limit(top_k)
            .with_additional(["distance"])
            .do()
        )

        documents = []
        if "data" in result and "Get" in result["data"]:
            for item in result["data"]["Get"]["Document"]:
                # Calculate score from distance (inverse relationship)
                distance = item.get("_additional", {}).get("distance", 0.5)
                score = max(0.0, min(1.0, 1.0 - distance))

                documents.append({
                    "id": item.get("_additional", {}).get("id", ""),
                    "title": item.get("title", "Unknown"),
                    "text": item.get("content", ""),
                    "topic": item.get("topic", ""),
                    "score": score,
                })

        return documents

    async def add_documents(self, documents: List[Dict]):
        """Add multiple documents to the vector store."""
        for doc in documents:
            self._add_document(
                doc.get("id"),
                doc.get("title"),
                doc.get("content"),
                doc.get("topic", "general"),
            )

    def search_by_topic(self, topic: str, top_k: int = 5) -> List[Dict]:
        """Search documents by topic."""
        result = (
            self.client.query.get("Document")
            .with_where({
                "path": ["topic"],
                "operator": "Equal",
                "valueString": topic,
            })
            .with_limit(top_k)
            .do()
        )

        documents = []
        if "data" in result and "Get" in result["data"]:
            for item in result["data"]["Get"]["Document"]:
                documents.append({
                    "id": item.get("_additional", {}).get("id", ""),
                    "title": item.get("title", "Unknown"),
                    "text": item.get("content", ""),
                    "score": 0.9,
                })

        return documents
