import { DemoType } from "./types";

export const DEMO_CONFIGS: Record<
  DemoType,
  {
    title: string;
    description: string;
    duration: string;
    autoplay: boolean;
    interactive: boolean;
    diagramFile: string;
  }
> = {
  "what-is-ai": {
    title: "What is Agentic AI?",
    description:
      "Understand the key components of agentic AI systems and how the PLAN→ACT→OBSERVE→REFLECT loop works.",
    duration: "~2-3 minutes",
    autoplay: true,
    interactive: false,
    diagramFile: "/diagrams/what-is-agentic-ai.json",
  },
  "rag-comparison": {
    title: "Classic RAG vs Agentic RAG",
    description:
      "See the differences between traditional RAG and agentic RAG side-by-side. Understand why agentic RAG is more powerful.",
    duration: "~1-2 minutes",
    autoplay: true,
    interactive: false,
    diagramFile: "/diagrams/rag-comparison.json",
  },
  "agentic-loop": {
    title: "Agentic RAG Reasoning Loop",
    description:
      "Watch the agentic RAG system execute in real-time. Enter a query and see it plan, retrieve, evaluate, generate, and refine.",
    duration: "Variable (~30-90 seconds per query)",
    autoplay: false,
    interactive: true,
    diagramFile: "/diagrams/agentic-rag-loop.json",
  },
};

export const EXAMPLE_QUERIES = [
  "What is prompt engineering?",
  "How does RAG work?",
  "What makes an AI system agentic?",
  "How can agentic RAG improve response quality?",
  "What are the key components of an agentic system?",
];
