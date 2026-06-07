"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw, Loader2 } from "lucide-react";
import { DemoType } from "@/lib/types";
import { DEMO_CONFIGS } from "@/lib/demo-constants";
import { useDemo } from "@/hooks/useDemo";
import { fetchExamples, streamDemo } from "@/lib/api-client";
import { DiagramViewer } from "./DiagramViewer";
import { ExecutionFlow } from "./ExecutionFlow";
import { BackendStatus } from "./BackendStatus";
import { TokenBurn } from "./TokenBurn";

export function DemoLayout({ demoType }: { demoType: DemoType }) {
  const config = DEMO_CONFIGS[demoType];
  const {
    agentic,
    classic,
    highlight,
    running,
    activeTrack,
    error,
    startRun,
    ingest,
    finish,
    fail,
    resetAll,
  } = useDemo();

  const [query, setQuery] = useState("");
  const [examples, setExamples] = useState<string[]>([]);
  const [compare, setCompare] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    resetAll();
    return () => stopRef.current?.();
  }, [demoType, resetAll]);

  useEffect(() => {
    if (config.interactive) fetchExamples().then(setExamples);
  }, [config.interactive]);

  const run = useCallback(
    (q?: string) => {
      stopRef.current?.();
      resetAll();

      const runAgentic = () => {
        startRun("agentic");
        stopRef.current = streamDemo(demoType, q, "agentic", {
          onEvent: (e) => ingest("agentic", e),
          onEnd: finish,
          onError: fail,
        });
      };

      if (config.interactive && compare) {
        startRun("classic");
        stopRef.current = streamDemo(demoType, q, "classic", {
          onEvent: (e) => ingest("classic", e),
          onError: fail,
          onEnd: runAgentic,
        });
      } else {
        runAgentic();
      }
    },
    [demoType, compare, config.interactive, startRun, ingest, finish, fail, resetAll],
  );

  useEffect(() => {
    if (!config.interactive) {
      const t = setTimeout(() => run(), 400);
      return () => clearTimeout(t);
    }
  }, [config.interactive, run]);

  const activeSteps = activeTrack === "classic" ? classic : agentic;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">
          {config.title}
        </h1>
        <p className="mt-2 max-w-3xl text-lg leading-relaxed text-ink-muted">
          {config.description}
        </p>
      </div>

      <BackendStatus />

      {error && (
        <div className="rounded-2xl border border-brand/20 bg-brand-tint px-4 py-3 text-sm text-brand-deep">
          {error} — is the backend running on{" "}
          <code className="font-mono">
            {process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}
          </code>
          ?
        </div>
      )}

      {config.interactive && (
        <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-black/5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && query && !running && run(query)}
              placeholder="Ask about prompt engineering, RAG, or agentic AI…"
              disabled={running}
              className="flex-1 rounded-xl border border-black/10 bg-canvas px-4 py-2.5 text-ink outline-none transition placeholder:text-ink-muted focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
            />
            <button
              onClick={() => run(query)}
              disabled={running || !query}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-2.5 font-semibold text-white shadow-[0_6px_18px_-6px_rgba(238,0,0,0.6)] transition hover:bg-brand-dark disabled:opacity-40 disabled:shadow-none"
            >
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {running ? "Running" : "Run"}
            </button>
            {(agentic.length > 0 || classic.length > 0) && !running && (
              <button
                onClick={resetAll}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 font-semibold text-ink transition hover:bg-black/[0.04]"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            )}
          </div>

          {/* Compare-with-classic toggle */}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={compare}
              onClick={() => !running && setCompare((c) => !c)}
              disabled={running}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50 ${
                compare ? "bg-brand" : "bg-black/15"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                  compare ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
            <div className="text-sm">
              <span className="font-semibold text-ink">Compare with Classic RAG</span>
              <span className="ml-2 text-ink-muted">
                runs the single-pass pipeline first, then the agentic loop — both bars side by side
              </span>
            </div>
          </div>

          {examples.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    setQuery(ex);
                    run(ex);
                  }}
                  disabled={running}
                  className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-brand/30 hover:bg-brand-tint hover:text-brand disabled:opacity-50"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!config.interactive && (
        <button
          onClick={() => run()}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 font-semibold text-white shadow-[0_6px_18px_-6px_rgba(238,0,0,0.6)] transition hover:bg-brand-dark disabled:opacity-40"
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {running ? "Playing…" : "Replay"}
        </button>
      )}

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="mb-3 font-display text-lg font-bold tracking-tight text-ink">
              Flow diagram
            </h2>
            <DiagramViewer demoType={demoType} highlight={highlight} />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="mb-3 font-display text-lg font-bold tracking-tight text-ink">
              Live execution
              {compare && (
                <span className="ml-2 align-middle text-xs font-medium text-ink-muted">
                  {activeTrack === "classic" ? "· classic pass" : "· agentic loop"}
                </span>
              )}
            </h2>
            <ExecutionFlow steps={activeSteps} running={running} />
          </motion.div>
        </div>

        {config.interactive && (
          <aside className="xl:w-72 xl:shrink-0">
            <TokenBurn agentic={agentic} classic={compare ? classic : null} />
          </aside>
        )}
      </div>
    </div>
  );
}
