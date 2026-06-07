"use client";

import { useEffect, useMemo } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { DemoStepData } from "@/lib/types";

// Red Hat red ramp — darkens with each loop to read as "more burn".
const LOOP_COLORS: [string, string][] = [
  ["#ff8a8a", "#ff5c5c"],
  ["#ff5c5c", "#ee0000"],
  ["#ee0000", "#cc0000"],
  ["#cc0000", "#a30000"],
  ["#a30000", "#7a0000"],
];
const SYNTH: [string, string] = ["#52525b", "#3f3f46"]; // generation = graphite (neutral)
const CLASSIC: [string, string] = ["#a1a1aa", "#71717a"]; // classic single pass = light graphite

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

function agenticSegments(steps: DemoStepData[]): {
  segments: Segment[];
  total: number;
  baseline: number;
} {
  const synth = steps.filter((s) => s.phase === "GENERATE").reduce((a, s) => a + tok(s), 0);
  const byIter = new Map<number, number>();
  for (const s of steps) {
    if (s.phase === "GENERATE") continue;
    const t = tok(s);
    if (t <= 0) continue;
    const it = s.iteration ?? 1;
    byIter.set(it, (byIter.get(it) ?? 0) + t);
  }
  const segments: Segment[] = [];
  if (synth > 0) segments.push({ key: "synth", label: "Synthesis", tokens: synth, from: SYNTH[0], to: SYNTH[1] });
  [...byIter.keys()]
    .sort((a, b) => a - b)
    .forEach((it) => {
      const c = LOOP_COLORS[Math.min(it - 1, LOOP_COLORS.length - 1)];
      segments.push({ key: `loop-${it}`, label: `Loop ${it}`, tokens: byIter.get(it)!, from: c[0], to: c[1] });
    });
  const total = segments.reduce((a, s) => a + s.tokens, 0);
  const baseline = steps.reduce((b, s) => (s.baseline_tokens ? Math.max(b, s.baseline_tokens) : b), 0) || synth;
  return { segments, total, baseline };
}

/** A stacked vertical bar with a value label above it. */
function Bar({
  segments,
  total,
  maxScale,
  barHeight,
  label,
  accent,
}: {
  segments: Segment[];
  total: number;
  maxScale: number;
  barHeight: number;
  label: string;
  accent: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm font-semibold tabular-nums text-ink">
        {total > 0 ? total.toLocaleString() : "—"}
      </div>
      <div
        className="relative w-16 shrink-0 overflow-hidden rounded-2xl bg-canvas ring-1 ring-inset ring-black/5"
        style={{ height: barHeight }}
      >
        <div className="absolute inset-x-1 bottom-1 flex flex-col-reverse">
          {segments.map((seg, i) => (
            <motion.div
              key={seg.key}
              initial={{ height: 0 }}
              animate={{ height: (seg.tokens / maxScale) * barHeight }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
              style={{ background: `linear-gradient(to top, ${seg.from}, ${seg.to})` }}
              className={i === segments.length - 1 ? "w-full rounded-t-lg" : "w-full"}
            />
          ))}
        </div>
      </div>
      <div className="text-xs font-semibold" style={{ color: accent }}>
        {label}
      </div>
    </div>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-ink-soft">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
      <span className="flex-1 truncate">{label}</span>
      <span className="tabular-nums text-ink-muted">{value.toLocaleString()}</span>
    </div>
  );
}

export function TokenBurn({
  agentic,
  classic,
  barHeight = 264,
}: {
  agentic: DemoStepData[];
  classic: DemoStepData[] | null;
  barHeight?: number;
}) {
  const agg = useMemo(() => agenticSegments(agentic), [agentic]);
  const measuredClassic = useMemo(
    () => (classic ? classic.reduce((a, s) => a + tok(s), 0) : 0),
    [classic],
  );

  // Classic value: the measured single-pass run when available, else the agentic
  // run's built-in single-pass estimate (baseline_tokens ≈ one generation call).
  const classicValue = measuredClassic > 0 ? measuredClassic : agg.baseline;
  const classicMeasured = measuredClassic > 0;

  const multiplier = classicValue > 0 && agg.total > 0 ? agg.total / classicValue : 0;
  const maxScale = Math.max(agg.total, classicValue) * 1.12 || 1;

  const spring = useSpring(0, { stiffness: 90, damping: 22 });
  useEffect(() => {
    spring.set(agg.total);
  }, [agg.total, spring]);
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  const hasData = agg.total > 0 || classicValue > 0;
  const classicSeg: Segment[] =
    classicValue > 0 ? [{ key: "classic", label: "Classic", tokens: classicValue, from: CLASSIC[0], to: CLASSIC[1] }] : [];
  const breakdown = agg.segments.slice().reverse(); // top-of-bar first

  return (
    <div className="rounded-3xl bg-white/70 p-5 shadow-card ring-1 ring-black/5 backdrop-blur-xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Token Burn
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <motion.span className="text-3xl font-semibold tabular-nums text-ink">
              {display}
            </motion.span>
            <span className="text-sm text-ink-muted">agentic tokens</span>
          </div>
        </div>
        {multiplier > 0 && (
          <div className="rounded-full bg-brand-tint px-3 py-1 text-sm font-bold text-brand">
            {multiplier.toFixed(1)}×
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="mt-6 py-10 text-center text-sm text-ink-muted">
          Run the loop to compare token usage.
        </div>
      ) : (
        <div className="mt-5 flex items-end gap-6">
          {/* Side-by-side bars */}
          <div className="flex shrink-0 items-end gap-5">
            <Bar
              segments={classicSeg}
              total={classicValue}
              maxScale={maxScale}
              barHeight={barHeight}
              label="Classic"
              accent="#71717a"
            />
            <Bar
              segments={agg.segments}
              total={agg.total}
              maxScale={maxScale}
              barHeight={barHeight}
              label="Agentic"
              accent="#ee0000"
            />
          </div>

          {/* Breakdown */}
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 pb-7">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
              Agentic breakdown
            </div>
            {breakdown.length === 0 ? (
              <div className="text-[11px] text-ink-muted">—</div>
            ) : (
              breakdown.map((seg) => (
                <LegendRow key={seg.key} color={seg.to} label={seg.label} value={seg.tokens} />
              ))
            )}
            <div className="mt-1 border-t border-black/5 pt-1.5">
              <LegendRow color={CLASSIC[1]} label="Classic RAG · 1 pass" value={classicValue} />
              <div className="mt-0.5 text-[10px] text-ink-muted">
                {classicMeasured ? "measured single pass" : "estimated single pass"}
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="mt-4 text-[11px] leading-snug text-ink-muted">
        Each reasoning loop adds plan + evaluate calls on top of generation — agentic
        RAG trades tokens for reliability.
      </p>
    </div>
  );
}
