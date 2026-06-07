"use client";

import { DemoLayout } from "@/components/DemoLayout";
import { DEMO_CONFIGS, EXAMPLE_QUERIES } from "@/lib/demo-constants";
import { DemoType } from "@/lib/types";
import { redirect } from "next/navigation";

export default function DemoPage({ params }: { params: { type: string } }) {
  const demoType = params.type as DemoType;

  // Validate demo type
  if (!["what-is-ai", "rag-comparison", "agentic-loop"].includes(demoType)) {
    redirect("/");
  }

  const config = DEMO_CONFIGS[demoType];

  if (!config) {
    redirect("/");
  }

  return (
    <DemoLayout
      demoType={demoType}
      title={config.title}
      description={config.description}
      interactive={config.interactive}
      exampleQueries={config.interactive ? EXAMPLE_QUERIES : undefined}
    />
  );
}
