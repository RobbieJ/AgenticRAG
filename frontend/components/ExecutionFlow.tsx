"use client";

import { useEffect, useRef } from "react";
import { DemoStepData } from "@/lib/types";
import { DemoStep } from "./DemoStep";

export function ExecutionFlow({
  steps,
  running,
}: {
  steps: DemoStepData[];
  running: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeStep = steps.length ? steps[steps.length - 1].step : -1;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [steps.length, steps[steps.length - 1]?.answer]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            running ? "animate-pulse bg-orange-500" : steps.length ? "bg-green-500" : "bg-gray-400"
          }`}
        />
        <span className="text-sm font-medium text-gray-700">
          {running ? "Executing…" : steps.length ? "Complete" : "Ready"}
        </span>
        <span className="ml-auto text-xs text-gray-400">{steps.length} steps</span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1" style={{ maxHeight: "70vh" }}>
        {steps.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            Execution steps will appear here.
          </div>
        ) : (
          steps.map((s, i) => (
            <DemoStep key={`${s.step}-${i}`} step={s} active={s.step === activeStep && running} />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
