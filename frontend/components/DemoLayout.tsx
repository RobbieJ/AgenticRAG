"use client";

import { DiagramViewer } from "./DiagramViewer";
import { ExecutionFlow } from "./ExecutionFlow";
import { motion } from "framer-motion";
import { useDemo } from "@/hooks/useDemo";
import { DemoType } from "@/lib/types";
import { useState, useEffect } from "react";
import { executeDemoSSE } from "@/lib/api-client";

interface DemoLayoutProps {
  demoType: DemoType;
  title: string;
  description: string;
  interactive?: boolean;
  exampleQueries?: string[];
}

export function DemoLayout({
  demoType,
  title,
  description,
  interactive = false,
  exampleQueries = [],
}: DemoLayoutProps) {
  const { executionResults, highlightedElements, isExecuting, reset, updateStep } = useDemo();
  const [isRunning, setIsRunning] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async (demoQuery?: string) => {
    reset();
    setIsRunning(true);
    setError(null);

    try {
      await executeDemoSSE(
        {
          demoType,
          query: demoQuery || query || undefined,
        },
        (event) => {
          updateStep(event);
        },
        (err) => {
          setError(err.message);
          setIsRunning(false);
        },
        () => {
          setIsRunning(false);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (!interactive) {
      handleExecute();
    }
  }, [interactive]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Title and Description */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-lg text-gray-600">{description}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-800 p-4 rounded-lg">
          <p className="font-semibold">Error: {error}</p>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Diagram */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Flow Diagram</h2>
          <DiagramViewer
            diagramType={demoType}
            highlightedElements={highlightedElements}
            isAnimating={isRunning}
          />
        </motion.div>

        {/* Right: Execution Flow */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Execution Flow</h2>
          <ExecutionFlow events={executionResults} isExecuting={isRunning} />
        </motion.div>
      </div>

      {/* Interactive Controls */}
      {interactive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Try It Out</h3>

          <div className="space-y-4">
            {/* Query Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter your question:
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., What is prompt engineering?"
                className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                disabled={isRunning}
              />
            </div>

            {/* Example Queries */}
            {exampleQueries.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Or try an example:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {exampleQueries.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleExecute(q)}
                      disabled={isRunning}
                      className="px-3 py-2 text-sm bg-white border border-blue-300 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Execute Button */}
            <div className="flex gap-3">
              <button
                onClick={() => handleExecute()}
                disabled={isRunning || !query}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isRunning ? "Executing..." : "Execute"}
              </button>

              {(executionResults.length > 0 || isRunning) && (
                <button
                  onClick={() => {
                    reset();
                    setIsRunning(false);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition"
                >
                  Reset
                </button>
              )}
            </div>

            {isRunning && (
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  ⚙️
                </motion.div>
                <p className="text-sm text-gray-600 mt-2">Processing your query...</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Auto-play Controls for non-interactive demos */}
      {!interactive && !isRunning && executionResults.length > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => handleExecute()}
          className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
        >
          ▶ Play Again
        </motion.button>
      )}
    </motion.div>
  );
}
