export type DemoType = "what-is-ai" | "rag-comparison" | "agentic-loop";

/** Mirrors backend.models.schemas.DemoEvent. */
export interface DemoEvent {
  step: number;
  phase: string;
  title: string;
  description?: string;
  code?: string | null;
  highlight: string[];
  documents?: { id: string; title: string; score: number }[] | null;
  score?: number | null;
  reasoning?: string | null;
  answer_delta?: string | null;
  answer?: string | null;
  iteration?: number | null;
  tokens_in?: number | null;
  tokens_out?: number | null;
  cumulative_tokens?: number | null;
  baseline_tokens?: number | null;
  done?: boolean;
}

/** A step as accumulated in the UI (answer deltas merged into `answer`). */
export interface DemoStepData extends DemoEvent {}

export interface Health {
  status: string;
  version: string;
  provider: string;
  demo_mode: boolean;
  answer_model: string;
  fast_model: string;
}

export interface DemoConfig {
  title: string;
  description: string;
  duration: string;
  interactive: boolean;
}
