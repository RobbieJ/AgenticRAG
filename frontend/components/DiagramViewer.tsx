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
    <div className="rounded-xl border-2 border-gray-200 bg-white p-3 shadow-sm">
      {demoType === "what-is-ai" && <WhatIsAgenticAI highlight={highlight} />}
      {demoType === "rag-comparison" && <RagComparison highlight={highlight} />}
      {demoType === "agentic-loop" && <AgenticLoop highlight={highlight} />}
    </div>
  );
}
