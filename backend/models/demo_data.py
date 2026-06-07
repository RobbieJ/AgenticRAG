DEMO_DOCUMENTS = {
    "doc_1": {
        "title": "Introduction to Prompt Engineering",
        "topic": "Prompt Engineering",
        "content": """Prompt engineering is the art and science of crafting effective instructions for AI language models.
        It involves designing prompts that clearly communicate your intent, provide necessary context, and guide the model
        toward producing desired outputs. Key aspects of prompt engineering include specificity, context provision,
        and iterative refinement. A well-crafted prompt can significantly improve the quality and relevance of AI-generated
        responses, making it an essential skill for anyone working with large language models.""",
    },
    "doc_2": {
        "title": "Advanced Prompt Engineering Techniques",
        "topic": "Prompt Engineering",
        "content": """Advanced prompt engineering techniques go beyond basic instruction writing. These include chain-of-thought prompting,
        which asks the model to explain its reasoning step-by-step, few-shot prompting which provides examples before the actual query,
        and role-based prompting where you assign the model a specific persona. Other advanced techniques include temperature adjustment,
        token limits, and multi-turn conversations. Mastering these techniques allows you to unlock the full potential of large language
        models and achieve better results across diverse tasks.""",
    },
    "doc_3": {
        "title": "Retrieval-Augmented Generation Fundamentals",
        "topic": "Retrieval-Augmented Generation",
        "content": """Retrieval-Augmented Generation (RAG) is a technique that combines information retrieval with language generation.
        The process works in two main steps: first, relevant documents are retrieved from a knowledge base based on the user's query;
        second, these retrieved documents serve as context for the language model to generate a more accurate and informed response.
        RAG systems are particularly useful when you need to ground AI responses in specific, up-to-date, or proprietary information.""",
    },
    "doc_4": {
        "title": "RAG System Architecture and Implementation",
        "topic": "Retrieval-Augmented Generation",
        "content": """A typical RAG system consists of several key components: a document collection (knowledge base), an embedding model
        that converts text to vectors, a vector database for efficient similarity search, a retrieval mechanism that fetches relevant
        documents, and a language model that generates responses based on retrieved context. The architecture often includes preprocessing
        steps like document chunking and indexing. Implementation considerations include choosing appropriate embedding models, optimizing
        retrieval speed, managing large knowledge bases, and ensuring response quality through evaluation metrics.""",
    },
    "doc_5": {
        "title": "What is Agentic AI?",
        "topic": "Agentic AI",
        "content": """Agentic AI refers to artificial intelligence systems that can autonomously plan, decide, and take actions toward
        achieving goals. Unlike traditional AI systems that simply process input and generate output, agentic AI systems can:
        set sub-goals, choose between multiple available actions, monitor progress, and adapt strategies based on feedback.
        Key characteristics include autonomy, goal-orientation, environmental awareness, and learning capability. Agentic AI
        combines planning, tool use, memory, reflection, and autonomy to create systems that can operate independently.""",
    },
    "doc_6": {
        "title": "Building Agentic Systems with RAG",
        "topic": "Agentic AI",
        "content": """Combining agentic capabilities with RAG creates powerful systems that can research, reason, and generate
        informed responses. An agentic RAG system can dynamically plan its retrieval strategy, evaluate retrieved information
        for relevance, and refine its approach based on evaluation scores. The system maintains memory of previous steps to avoid
        redundant queries, reflects on its outputs, and decides whether to retrieve more information or synthesize a final answer.
        This approach is particularly effective for complex queries that require iterative search refinement.""",
    },
    "doc_7": {
        "title": "The Planning Module in Agentic Systems",
        "topic": "Agentic AI",
        "content": """The planning module is responsible for decomposing complex goals into actionable steps. In an agentic RAG context,
        planning involves analyzing the user's query, identifying what information is needed, determining the best retrieval strategy,
        and setting evaluation criteria for success. Effective planning reduces unnecessary retrieval calls and improves overall system
        efficiency. The planning module can rewrite queries for better semantic search, identify multiple retrieval approaches, and
        anticipate potential information gaps.""",
    },
    "doc_8": {
        "title": "Tool Use in Agentic AI Systems",
        "topic": "Agentic AI",
        "content": """Tool use is a critical capability that allows agentic systems to interact with external resources. In the context
        of RAG, tools include vector databases for retrieval, embedding models for query transformation, language models for reasoning
        and generation, and evaluation tools for assessing response quality. An effective agentic system can select appropriate tools
        based on the task at hand, compose multiple tools into workflows, handle tool failures gracefully, and understand tool
        capabilities and limitations.""",
    },
    "doc_9": {
        "title": "Memory Management in Agentic Systems",
        "topic": "Agentic AI",
        "content": """Memory systems in agentic AI store information about previous interactions, decisions, and outcomes. This enables
        the system to learn from past attempts, avoid repeating unsuccessful strategies, and maintain context across multiple reasoning
        steps. There are different types of memory: short-term (current conversation context), long-term (historical patterns and facts),
        and semantic (concepts and relationships). Effective memory management is crucial for preventing infinite loops and ensuring
        efficient reasoning processes.""",
    },
    "doc_10": {
        "title": "Reflection and Self-Correction in AI Agents",
        "topic": "Agentic AI",
        "content": """Reflection is the ability of an agentic system to evaluate its own outputs and performance. In RAG systems, reflection
        helps determine if retrieved documents adequately answer the query, if the generated response is accurate, or if further refinement
        is needed. Self-correction mechanisms allow the system to modify its approach based on reflection results. This could involve
        rephrasing queries, retrieving from different sources, or adjusting generation parameters. Reflection and self-correction are key
        to achieving high-quality responses without human intervention.""",
    },
}

DEMO_QUERIES = {
    "example_1": "What is prompt engineering?",
    "example_2": "How does RAG work?",
    "example_3": "What makes an AI system agentic?",
    "example_4": "How can I improve prompt engineering?",
    "example_5": "What is the difference between RAG and traditional retrieval?",
}
