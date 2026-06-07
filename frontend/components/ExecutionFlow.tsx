"use client";

import { ExecutionFlowProps } from "@/lib/types";
import { DemoStep } from "./DemoStep";
import { motion } from "framer-motion";

export function ExecutionFlow({ events, isExecuting }: ExecutionFlowProps) {
  const currentStep = events.length > 0 ? events[events.length - 1].step : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Status indicator */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
        {isExecuting ? (
          <>
            <motion.div
              className="w-3 h-3 bg-blue-500 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-sm font-semibold text-blue-700">
              Executing step {currentStep}...
            </span>
          </>
        ) : events.length > 0 ? (
          <>
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-sm font-semibold text-green-700">
              Complete! ({events.length} steps)
            </span>
          </>
        ) : (
          <>
            <div className="w-3 h-3 bg-gray-400 rounded-full" />
            <span className="text-sm font-semibold text-gray-600">Ready to execute</span>
          </>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Demo execution will appear here...</p>
          </div>
        ) : (
          events.map((event, index) => (
            <DemoStep
              key={index}
              event={event}
              isActive={event.step === currentStep}
              isCompleted={event.step < currentStep}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}
