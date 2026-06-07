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
  const { steps, highlight, running, error, start, ingest, finish, fail, reset } = useDemo();

  const [query, setQuery] = useState("");
  const [examples, setExamples] = useState<string[]>([]);
  const stopRef = useRef<(() => void) | null>(null);

  // Reset store when switching demos; stop any in-flight stream.
  useEffect(() => {
    reset();
    return () => stopRef.current?.();
  }, [demoType, reset]);

  useEffect(() => {
    if (config.interactive) fetchExamples().then(setExamples);
  }, [config.interactive]);

  const run = useCallback(
    (q?: string) => {
      stopRef.current?.();
      start();
      stopRef.current = streamDemo(demoType, q, {
        onEvent: ingest,
        onEnd: finish,
        onError: fail,
      });
    },
    [demoType, start, ingest, finish, fail],
  );

  // Auto-play scripted demos once on load.
  useEffect(() => {
    if (!config.interactive) {
      const t = setTimeout(() => run(), 400);
      return () => clearTimeout(t);
    }
  }, [config.interactive, run]);

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
            {steps.length > 0 && !running && (
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-300"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            )}
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
            <h2 className="mb-3 text-lg font-bold text-gray-900">Live execution</h2>
            <ExecutionFlow steps={steps} running={running} />
          </motion.div>
        </div>

        {config.interactive && (
          <aside className="xl:w-64 xl:shrink-0">
            <TokenBurn steps={steps} />
          </aside>
        )}
      </div>
    </div>
  );
}
