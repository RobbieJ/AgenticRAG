"use client";

import { motion } from "framer-motion";
import { DemoStepData } from "@/lib/types";

const PHASE_COLOR: Record<string, string> = {
  QUERY: "bg-slate-500",
  PLAN: "bg-violet-500",
  RETRIEVE: "bg-sky-500",
  EVALUATE: "bg-amber-500",
  REFINE: "bg-rose-500",
  GENERATE: "bg-violet-600",
  VERIFY: "bg-emerald-500",
  COMPLETE: "bg-green-600",
  CLASSIC: "bg-sky-500",
  AGENTIC: "bg-violet-500",
  ACT: "bg-emerald-500",
  OBSERVE: "bg-amber-500",
  REFLECT: "bg-rose-500",
  LOOP: "bg-violet-600",
  SUMMARY: "bg-green-600",
};

export function DemoStep({ step, active }: { step: DemoStepData; active: boolean }) {
  const color = PHASE_COLOR[step.phase] ?? "bg-slate-500";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-lg border p-3 ${
        active ? "border-orange-400 bg-orange-50 shadow-sm" : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`inline-flex h-6 items-center rounded-full px-2 text-xs font-bold text-white ${color}`}>
          {step.phase}
        </span>
        <span className="font-semibold text-gray-900">{step.title}</span>
        {step.iteration ? (
          <span className="ml-auto text-xs text-gray-400">iteration {step.iteration}</span>
        ) : null}
      </div>

      {step.description && (
        <p className="mt-2 text-sm text-gray-600">{step.description}</p>
      )}

      {step.code && (
        <pre className="mt-2 overflow-x-auto rounded bg-slate-900 p-2 text-xs leading-relaxed text-slate-100">
          <code>{step.code}</code>
        </pre>
      )}

      {step.documents && step.documents.length > 0 && (
        <div className="mt-2 space-y-1">
          {step.documents.map((d) => (
            <div key={d.id} className="flex items-center gap-2 text-xs">
              <span className="font-mono text-gray-400">{d.score.toFixed(3)}</span>
              <div className="h-1.5 flex-1 rounded bg-gray-100">
                <div
                  className="h-1.5 rounded bg-sky-400"
                  style={{ width: `${Math.min(100, d.score * 160)}%` }}
                />
              </div>
              <span className="truncate text-gray-700">{d.title}</span>
            </div>
          ))}
        </div>
      )}

      {typeof step.score === "number" && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-gray-200">
              <div
                className={`h-2 rounded-full ${step.score >= 0.7 ? "bg-green-500" : "bg-amber-500"}`}
                style={{ width: `${step.score * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold">{(step.score * 100).toFixed(0)}%</span>
          </div>
          {step.reasoning && <p className="mt-1 text-xs italic text-gray-500">{step.reasoning}</p>}
        </div>
      )}

      {step.answer && (
        <div className="mt-2 whitespace-pre-wrap rounded border border-gray-200 bg-gray-50 p-2 text-sm text-gray-800">
          {step.answer}
          {active && step.phase === "GENERATE" && (
            <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-violet-500 align-middle" />
          )}
        </div>
      )}
    </motion.div>
  );
}
