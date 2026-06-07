"use client";

import { motion } from "framer-motion";
import { DemoStepData } from "@/lib/types";

// Muted, cohesive phase palette (Red Hat red reserved for the active state).
const PHASE_COLOR: Record<string, string> = {
  QUERY: "bg-ink",
  PLAN: "bg-brand",
  RETRIEVE: "bg-sky-600",
  EVALUATE: "bg-amber-500",
  REFINE: "bg-brand-deep",
  GENERATE: "bg-ink",
  VERIFY: "bg-emerald-600",
  COMPLETE: "bg-emerald-600",
  CLASSIC: "bg-sky-600",
  AGENTIC: "bg-brand",
  ACT: "bg-emerald-600",
  OBSERVE: "bg-amber-500",
  REFLECT: "bg-brand-deep",
  LOOP: "bg-ink",
  SUMMARY: "bg-emerald-600",
};

export function DemoStep({ step, active }: { step: DemoStepData; active: boolean }) {
  const color = PHASE_COLOR[step.phase] ?? "bg-ink";
  const tokens = (step.tokens_in ?? 0) + (step.tokens_out ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl border p-3 transition ${
        active ? "border-brand/40 bg-brand-tint shadow-sm" : "border-black/5 bg-white"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex h-6 items-center rounded-full px-2 text-[11px] font-bold tracking-wide text-white ${color}`}
        >
          {step.phase}
        </span>
        <span className="font-display font-bold text-ink">{step.title}</span>
        <div className="ml-auto flex items-center gap-2">
          {tokens > 0 ? (
            <span className="rounded-full bg-brand-tint px-2 py-0.5 text-[10px] font-semibold tabular-nums text-brand">
              +{tokens.toLocaleString()} tok
            </span>
          ) : null}
          {step.iteration ? (
            <span className="text-xs text-ink-muted">iteration {step.iteration}</span>
          ) : null}
        </div>
      </div>

      {step.description && (
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.description}</p>
      )}

      {step.code && (
        <pre className="mt-2 overflow-x-auto rounded-xl bg-ink p-3 font-mono text-xs leading-relaxed text-white/90">
          <code>{step.code}</code>
        </pre>
      )}

      {step.documents && step.documents.length > 0 && (
        <div className="mt-2 space-y-1">
          {step.documents.map((d) => (
            <div key={d.id} className="flex items-center gap-2 text-xs">
              <span className="font-mono text-ink-muted">{d.score.toFixed(3)}</span>
              <div className="h-1.5 flex-1 rounded-full bg-black/5">
                <div
                  className="h-1.5 rounded-full bg-sky-500"
                  style={{ width: `${Math.min(100, d.score * 160)}%` }}
                />
              </div>
              <span className="truncate text-ink-soft">{d.title}</span>
            </div>
          ))}
        </div>
      )}

      {typeof step.score === "number" && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-black/5">
              <div
                className={`h-2 rounded-full ${step.score >= 0.7 ? "bg-emerald-500" : "bg-amber-500"}`}
                style={{ width: `${step.score * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold tabular-nums text-ink">
              {(step.score * 100).toFixed(0)}%
            </span>
          </div>
          {step.reasoning && <p className="mt-1 text-xs italic text-ink-muted">{step.reasoning}</p>}
        </div>
      )}

      {step.answer && (
        <div className="mt-2 whitespace-pre-wrap rounded-xl border border-black/5 bg-canvas p-3 text-sm leading-relaxed text-ink-soft">
          {step.answer}
          {active && step.phase === "GENERATE" && (
            <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-brand align-middle" />
          )}
        </div>
      )}
    </motion.div>
  );
}
