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

      // Compare mode: run the classic single pass first, then the agentic loop.
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
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{config.title}</h1>
        <p className="mt-1 text-gray-600">{config.description}</p>
      </div>

      <BackendStatus />

      {error && (
        <div className="rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error} — is the backend running on{" "}
          <code>{process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}</code>?
        </div>
      )}

      {config.interactive && (
        <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && query && !running && run(query)}
              placeholder="Ask a question about prompt engineering, RAG, or agentic AI…"
              disabled={running}
              className="flex-1 rounded-lg border-2 border-violet-300 px-4 py-2 focus:border-violet-600 focus:outline-none"
            />
            <button
              onClick={() => run(query)}
              disabled={running || !query}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-2 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {running ? "Running" : "Run"}
            </button>
            {(agentic.length > 0 || classic.length > 0) && !running && (
              <button
                onClick={resetAll}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-300"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            )}
          </div>

          {/* Compare-with-classic toggle */}
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={compare}
              onClick={() => !running && setCompare((c) => !c)}
              disabled={running}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50 ${
                compare ? "bg-violet-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                  compare ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
            <div className="text-sm">
              <span className="font-semibold text-gray-800">Compare with Classic RAG</span>
              <span className="ml-2 text-gray-500">
                runs the single-pass pipeline first, then the agentic loop — both bars side by side
              </span>
            </div>
          </div>

          {examples.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    setQuery(ex);
                    run(ex);
                  }}
                  disabled={running}
                  className="rounded-full border border-violet-300 bg-white px-3 py-1 text-xs text-violet-700 transition hover:bg-violet-100 disabled:opacity-50"
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
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {running ? "Playing…" : "Replay"}
        </button>
      )}

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="mb-3 text-lg font-bold text-gray-900">Flow diagram</h2>
            <DiagramViewer demoType={demoType} highlight={highlight} />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="mb-3 text-lg font-bold text-gray-900">
              Live execution
              {compare && (
                <span className="ml-2 align-middle text-xs font-medium text-gray-400">
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
