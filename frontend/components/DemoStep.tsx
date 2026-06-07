"use client";

import { DemoStepProps } from "@/lib/types";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function DemoStep({ event, isActive, isCompleted }: DemoStepProps) {
  const [isExpanded, setIsExpanded] = useState(isActive);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`border-2 rounded-lg p-4 mb-3 transition-all ${
        isActive
          ? "border-blue-500 bg-blue-50"
          : isCompleted
            ? "border-green-500 bg-green-50"
            : "border-gray-200 bg-gray-50"
      }`}
    >
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
              isCompleted
                ? "bg-green-500 text-white"
                : isActive
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-700"
            }`}
          >
            {event.step}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{event.name}</h3>
            {event.description && (
              <p className="text-sm text-gray-600">{event.description}</p>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="text-gray-500" />
        </motion.div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-4 pt-4 border-t border-gray-300 space-y-3"
        >
          {event.codeBlock && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">CODE:</p>
              <pre className="bg-slate-900 text-white text-xs p-3 rounded overflow-x-auto">
                {event.codeBlock}
              </pre>
            </div>
          )}

          {event.results && event.results.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">RESULTS:</p>
              <div className="space-y-2">
                {event.results.map((result: any, i: number) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 rounded p-2 text-xs"
                  >
                    {typeof result === "object" ? (
                      <pre>{JSON.stringify(result, null, 2)}</pre>
                    ) : (
                      <p>{String(result)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {event.score !== undefined && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">
                CONFIDENCE SCORE:
              </p>
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      event.score >= 0.7 ? "bg-green-500" : "bg-yellow-500"
                    }`}
                    style={{ width: `${event.score * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{(event.score * 100).toFixed(0)}%</span>
              </div>
            </div>
          )}

          {event.reasoning && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">REASONING:</p>
              <p className="text-sm text-gray-700">{event.reasoning}</p>
            </div>
          )}

          {event.response && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">RESPONSE:</p>
              <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                {event.response}
              </p>
            </div>
          )}

          {event.finalResult && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">FINAL RESULT:</p>
              <pre className="bg-white p-3 rounded border border-gray-200 text-xs overflow-x-auto">
                {JSON.stringify(event.finalResult, null, 2)}
              </pre>
            </div>
          )}

          {event.looping && (
            <div className="bg-yellow-100 border border-yellow-400 rounded p-3">
              <p className="text-sm text-yellow-800 font-semibold">⟳ Looping back to refine...</p>
            </div>
          )}

          {event.executionTime && (
            <p className="text-xs text-gray-500">
              ⏱️ Execution time: {event.executionTime.toFixed(2)}s
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
