"use client";

import { useEffect, useMemo } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { DemoStepData } from "@/lib/types";

const BAR_PX = 288; // matches h-72

// Violet ramp — darkens with each loop to read as "more burn".
const LOOP_COLORS: [string, string][] = [
  ["#c4b5fd", "#a78bfa"],
  ["#a78bfa", "#8b5cf6"],
  ["#8b5cf6", "#7c3aed"],
  ["#7c3aed", "#6d28d9"],
  ["#6d28d9", "#5b21b6"],
];
const SYNTH: [string, string] = ["#34d399", "#10b981"]; // generation = emerald

interface Segment {
  key: string;
  label: string;
  tokens: number;
  from: string;
  to: string;
}

function tok(s: DemoStepData): number {
  return (s.tokens_in ?? 0) + (s.tokens_out ?? 0);
}

export function TokenBurn({ steps }: { steps: DemoStepData[] }) {
  const { segments, total, baseline } = useMemo(() => {
    // Generation (synthesis) tokens — what a classic single-pass RAG also pays.
    const synth = steps
      .filter((s) => s.phase === "GENERATE")
      .reduce((a, s) => a + tok(s), 0);

    // Reasoning overhead grouped per loop iteration.
    const byIter = new Map<number, number>();
    for (const s of steps) {
      if (s.phase === "GENERATE") continue;
      const t = tok(s);
      if (t <= 0) continue;
      const it = s.iteration ?? 1;
      byIter.set(it, (byIter.get(it) ?? 0) + t);
    }

    // Stack synthesis at the bottom so the "Classic RAG" marker sits at its top.
    const segs: Segment[] = [];
    if (synth > 0) segs.push({ key: "synth", label: "Synthesis", tokens: synth, from: SYNTH[0], to: SYNTH[1] });
    [...byIter.keys()]
      .sort((a, b) => a - b)
      .forEach((it) => {
        const c = LOOP_COLORS[Math.min(it - 1, LOOP_COLORS.length - 1)];
        segs.push({ key: `loop-${it}`, label: `Loop ${it}`, tokens: byIter.get(it)!, from: c[0], to: c[1] });
      });

    const total = segs.reduce((a, s) => a + s.tokens, 0);
    const baseline =
      steps.reduce((b, s) => (s.baseline_tokens ? Math.max(b, s.baseline_tokens) : b), 0) || synth;
    return { segments: segs, total, baseline };
  }, [steps]);

  const maxScale = Math.max(total, baseline) * 1.12 || 1;
  const multiplier = baseline > 0 ? total / baseline : 0;

  // Animated count-up for the running total.
  const spring = useSpring(0, { stiffness: 90, damping: 22 });
  useEffect(() => {
    spring.set(total);
  }, [total, spring]);
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  return (
    <div className="sticky top-6 rounded-2xl border border-gray-200/70 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
        Token Burn
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <motion.span className="text-3xl font-semibold tabular-nums text-gray-900">
          {display}
        </motion.span>
        <span className="text-sm text-gray-400">tokens</span>
      </div>
      {multiplier > 0 ? (
        <div className="mt-0.5 text-xs font-semibold text-violet-600">
          {multiplier.toFixed(1)}× a classic single-pass RAG
        </div>
      ) : (
        <div className="mt-0.5 text-xs text-gray-400">run the loop to see usage</div>
      )}

      <div className="mt-5 flex items-stretch gap-3">
        {/* the meter */}
        <div className="relative h-72 w-16 shrink-0 overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-inset ring-gray-200">
          <div className="absolute inset-x-1 bottom-1 flex flex-col-reverse">
            {segments.map((seg, i) => (
              <motion.div
                key={seg.key}
                initial={{ height: 0 }}
                animate={{ height: (seg.tokens / maxScale) * BAR_PX }}
                transition={{ type: "spring", stiffness: 120, damping: 22 }}
                style={{ background: `linear-gradient(to top, ${seg.from}, ${seg.to})` }}
                className={i === segments.length - 1 ? "w-full rounded-t-lg" : "w-full"}
              />
            ))}
          </div>

          {/* Classic RAG baseline marker */}
          {baseline > 0 && total > 0 && (
            <div
              className="pointer-events-none absolute inset-x-0"
              style={{ bottom: (baseline / maxScale) * BAR_PX + 4 }}
            >
              <div className="border-t-2 border-dashed border-gray-500/60" />
            </div>
          )}
        </div>

        {/* legend */}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5 text-[11px]">
          <div className="leading-tight text-gray-500">
            <span className="font-semibold text-gray-700">Classic RAG</span>
            <div className="text-gray-400">
              {baseline > 0 ? `~${baseline.toLocaleString()} tokens · 1 pass` : "single pass"}
            </div>
          </div>
          <div className="space-y-1.5">
            {segments.length === 0 ? (
              <div className="text-gray-300">—</div>
            ) : (
              segments
                .slice()
                .reverse()
                .map((seg) => (
                  <div key={seg.key} className="flex items-center gap-1.5 text-gray-600">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: seg.to }} />
                    <span className="flex-1 truncate">{seg.label}</span>
                    <span className="tabular-nums text-gray-400">{seg.tokens.toLocaleString()}</span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-snug text-gray-400">
        Each reasoning loop adds plan + evaluate calls on top of generation — agentic
        RAG trades tokens for reliability.
      </p>
    </div>
  );
}
