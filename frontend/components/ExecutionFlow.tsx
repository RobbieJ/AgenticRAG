"use client";

import { useEffect, useRef } from "react";
import { DemoStepData } from "@/lib/types";
import { DemoStep } from "./DemoStep";

export function ExecutionFlow({
  steps,
  running,
  expanded = false,
}: {
  steps: DemoStepData[];
  running: boolean;
  expanded?: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeStep = steps.length ? steps[steps.length - 1].step : -1;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [steps.length, steps[steps.length - 1]?.answer]);

  return (
    <div className="flex h-full flex-col rounded-3xl bg-white p-4 shadow-card ring-1 ring-black/5">
      <div className="mb-3 flex items-center gap-2 rounded-2xl bg-canvas px-3 py-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            running
              ? "animate-pulse bg-brand"
              : steps.length
                ? "bg-emerald-500"
                : "bg-black/25"
          }`}
        />
        <span className="text-sm font-medium text-ink-soft">
          {running ? "Executing…" : steps.length ? "Complete" : "Ready"}
        </span>
        <span className="ml-auto text-xs text-ink-muted">{steps.length} steps</span>
      </div>

      <div
        className="flex-1 space-y-2 overflow-y-auto pr-1"
        style={{ maxHeight: expanded ? "78vh" : "70vh" }}
      >
        {steps.length === 0 ? (
          <div className="py-14 text-center text-sm text-ink-muted">
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
