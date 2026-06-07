"use client";

import { DemoType } from "@/lib/types";
import { WhatIsAgenticAI } from "./diagrams/WhatIsAgenticAI";
import { RagComparison } from "./diagrams/RagComparison";
import { AgenticLoop } from "./diagrams/AgenticLoop";

export function DiagramViewer({
  demoType,
  highlight,
}: {
  demoType: DemoType;
  highlight: string[];
}) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-card ring-1 ring-black/5">
      {demoType === "what-is-ai" && <WhatIsAgenticAI highlight={highlight} />}
      {demoType === "rag-comparison" && <RagComparison highlight={highlight} />}
      {demoType === "agentic-loop" && <AgenticLoop highlight={highlight} />}
    </div>
  );
}
