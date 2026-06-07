"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { DemoLayout } from "@/components/DemoLayout";
import { DEMO_CONFIGS } from "@/lib/demo-constants";
import { DemoType } from "@/lib/types";

const VALID: DemoType[] = ["what-is-ai", "rag-comparison", "agentic-loop"];

export default function DemoPage() {
  const params = useParams();
  const type = params?.type as DemoType;

  if (!VALID.includes(type)) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-600">Unknown demo.</p>
        <Link href="/" className="text-violet-600 underline">
          Back to demos
        </Link>
      </div>
    );
  }

  return <DemoLayout key={type} demoType={type} />;
}
