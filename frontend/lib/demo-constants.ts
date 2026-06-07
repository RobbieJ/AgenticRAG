import { DemoConfig, DemoType } from "./types";

export const DEMO_CONFIGS: Record<DemoType, DemoConfig> = {
  "what-is-ai": {
    title: "What is Agentic AI?",
    description:
      "An LLM that doesn't just answer — it plans, acts, observes, and self-corrects in a loop.",
    duration: "~1 min · auto-play",
    interactive: false,
  },
  "rag-comparison": {
    title: "Classic RAG vs Agentic RAG",
    description:
      "Same goal — ground the answer in your data. Very different machinery.",
    duration: "~1 min · auto-play",
    interactive: false,
  },
  "agentic-loop": {
    title: "Agentic RAG: the reasoning loop",
    description:
      "Retrieval becomes a control loop — retrieve, reason, decide, then retrieve again or stop. Runs live against the knowledge base.",
    duration: "live · enter a query",
    interactive: true,
  },
};

export const DEMO_ORDER: DemoType[] = [
  "what-is-ai",
  "rag-comparison",
  "agentic-loop",
];
