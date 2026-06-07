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

function agenticSegments(steps: DemoStepData[]): { segments: Segment[]; total: number; baseline: number } {
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

/** A stacked vertical bar. */
function Bar({
  segments,
  maxScale,
  barHeight,
  width = "w-16",
}: {
  segments: Segment[];
  maxScale: number;
  barHeight: number;
  width?: string;
}) {
  return (
    <div
      className={`relative ${width} shrink-0 overflow-hidden rounded-2xl bg-canvas ring-1 ring-inset ring-black/5`}
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
  );
}

export function TokenBurn({
  agentic,
  classic,
  barHeight = 288,
}: {
  agentic: DemoStepData[];
  classic: DemoStepData[] | null;
  barHeight?: number;
}) {
  const agg = useMemo(() => agenticSegments(agentic), [agentic]);
  const classicTotal = useMemo(
    () => (classic ? classic.reduce((a, s) => a + tok(s), 0) : 0),
    [classic],
  );

  const compareMode = classic !== null;
  const denom = compareMode ? classicTotal : agg.baseline;
  const multiplier = denom > 0 && agg.total > 0 ? agg.total / denom : 0;
  const maxScale = Math.max(agg.total, denom) * 1.12 || 1;

  const spring = useSpring(0, { stiffness: 90, damping: 22 });
  useEffect(() => {
    spring.set(agg.total);
  }, [agg.total, spring]);
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  const classicSeg: Segment[] = classicTotal > 0
    ? [{ key: "classic", label: "Classic", tokens: classicTotal, from: SYNTH[0], to: SYNTH[1] }]
    : [];

  return (
    <div className="rounded-3xl bg-white/70 p-5 shadow-card ring-1 ring-black/5 backdrop-blur-xl">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
        Token Burn
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <motion.span className="text-3xl font-semibold tabular-nums text-ink">
          {display}
        </motion.span>
        <span className="text-sm text-ink-muted">tokens</span>
      </div>
      {multiplier > 0 ? (
        <div className="mt-0.5 text-xs font-semibold text-brand">
          {multiplier.toFixed(1)}× a classic single-pass RAG
        </div>
      ) : (
        <div className="mt-0.5 text-xs text-ink-muted">
          {compareMode ? "running comparison…" : "run the loop to see usage"}
        </div>
      )}

      {compareMode ? (
        // ---- side-by-side comparison ----
        <div className="mt-5">
          <div className="flex items-end justify-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <Bar segments={classicSeg} maxScale={maxScale} barHeight={barHeight} width="w-16" />
              <div className="text-center">
                <div className="text-xs font-semibold text-ink">Classic</div>
                <div className="text-[11px] tabular-nums text-ink-muted">
                  {classicTotal.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Bar segments={agg.segments} maxScale={maxScale} barHeight={barHeight} width="w-16" />
              <div className="text-center">
                <div className="text-xs font-semibold text-brand">Agentic</div>
                <div className="text-[11px] tabular-nums text-ink-muted">
                  {agg.total.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // ---- single agentic bar with a classic baseline marker ----
        <div className="mt-5 flex items-stretch gap-3">
          <div className="relative">
            <Bar segments={agg.segments} maxScale={maxScale} barHeight={barHeight} />
            {agg.baseline > 0 && agg.total > 0 && (
              <div
                className="pointer-events-none absolute inset-x-0"
                style={{ bottom: (agg.baseline / maxScale) * barHeight + 4 }}
              >
                <div className="border-t-2 border-dashed border-ink/40" />
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5 text-[11px]">
            <div className="leading-tight text-ink-muted">
              <span className="font-semibold text-ink">Classic RAG</span>
              <div className="text-ink-muted">
                {agg.baseline > 0 ? `~${agg.baseline.toLocaleString()} tokens · 1 pass` : "single pass"}
              </div>
            </div>
            <div className="space-y-1.5">
              {agg.segments.length === 0 ? (
                <div className="text-black/20">—</div>
              ) : (
                agg.segments
                  .slice()
                  .reverse()
                  .map((seg) => (
                    <div key={seg.key} className="flex items-center gap-1.5 text-ink-soft">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: seg.to }} />
                      <span className="flex-1 truncate">{seg.label}</span>
                      <span className="tabular-nums text-ink-muted">{seg.tokens.toLocaleString()}</span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* shared legend in compare mode */}
      {compareMode && agg.segments.length > 0 && (
        <div className="mx-auto mt-4 max-w-xs space-y-1.5 border-t border-black/5 pt-3 text-[11px]">
          {agg.segments
            .slice()
            .reverse()
            .map((seg) => (
              <div key={seg.key} className="flex items-center gap-1.5 text-ink-soft">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: seg.to }} />
                <span className="flex-1 truncate">{seg.label}</span>
                <span className="tabular-nums text-ink-muted">{seg.tokens.toLocaleString()}</span>
              </div>
            ))}
        </div>
      )}

      <p className="mt-4 text-[11px] leading-snug text-ink-muted">
        Each reasoning loop adds plan + evaluate calls on top of generation — agentic
        RAG trades tokens for reliability.
      </p>
    </div>
  );
}
