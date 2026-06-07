"use client";

import { useCallback, useState } from "react";
import { useDemo } from "./useDemo";
import { useSSE } from "./useSSE";
import { DemoType, DemoEvent } from "@/lib/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export function useDemoExecution() {
  const {
    updateStep,
    reset,
    setDemoType,
    setQuery,
    demoType,
    query,
    isExecuting,
  } = useDemo();
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const startExecution = useCallback(
    (type: DemoType, demoQuery?: string) => {
      setDemoType(type);
      if (demoQuery) setQuery(demoQuery);
      setError(null);
      setIsComplete(false);

      const url = `${BACKEND_URL}/demo/execute?demoType=${type}&query=${encodeURIComponent(
        demoQuery || "What is agentic AI?"
      )}`;

      useSSE(
        url,
        (event: DemoEvent) => {
          updateStep(event);
        },
        (err: Error) => {
          setError(err.message);
        },
        () => {
          setIsComplete(true);
        }
      );
    },
    [setDemoType, setQuery, updateStep]
  );

  const resetDemo = useCallback(() => {
    reset();
    setError(null);
    setIsComplete(false);
  }, [reset]);

  return {
    startExecution,
    resetDemo,
    error,
    isComplete,
    demoType,
    query,
    isExecuting,
  };
}
