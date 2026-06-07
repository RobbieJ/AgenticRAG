// Demo Types
export type DemoType = "what-is-ai" | "rag-comparison" | "agentic-loop";

export interface DiagramElement {
  id: string;
  type: string;
  text?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  opacity?: number;
  strokeWidth?: number;
}

export interface Diagram {
  id: string;
  name: string;
  type: DemoType;
  elements: DiagramElement[];
}

// Demo Event Types
export interface DemoEvent {
  step: number;
  name: string;
  description?: string;
  codeBlock?: string;
  highlightDiagram?: string[];
  executionTime?: number;
  results?: unknown[];
  score?: number;
  reasoning?: string;
  response?: string;
  decision?: string;
  finalResult?: unknown;
  looping?: boolean;
}

export interface DemoExecuteRequest {
  query?: string;
  demoType: DemoType;
}

// Component Props
export interface DiagramViewerProps {
  diagramType: DemoType;
  highlightedElements?: string[];
  isAnimating?: boolean;
}

export interface ExecutionFlowProps {
  events: DemoEvent[];
  isExecuting: boolean;
}

export interface CodeBlockDisplayProps {
  code: string;
  language?: string;
  title?: string;
}

export interface DemoStepProps {
  event: DemoEvent;
  isActive: boolean;
  isCompleted: boolean;
}

// State Management
export interface DemoStore {
  currentStep: number;
  highlightedElements: string[];
  codeBlocks: string[];
  executionResults: DemoEvent[];
  isExecuting: boolean;
  demoType: DemoType;
  query?: string;

  updateStep: (event: DemoEvent) => void;
  reset: () => void;
  setDemoType: (type: DemoType) => void;
  setQuery: (query: string) => void;
}

// Document Types
export interface Document {
  id: string;
  title: string;
  text: string;
  score?: number;
}

// RAG Pipeline Types
export interface QueryRewriteResult {
  original: string;
  rewritten: string;
}

export interface RetrievalResult {
  documents: Document[];
  executionTime: number;
}

export interface EvaluationResult {
  score: number;
  reasoning: string;
  shouldRefine: boolean;
}

export interface GenerationResult {
  response: string;
  sourceDocuments: string[];
}

export interface RefinementResult {
  newQuery: string;
  feedback: string;
  iteration: number;
}
