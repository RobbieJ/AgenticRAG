"use client";

import { create } from "zustand";
import { DemoEvent, DemoStepData } from "@/lib/types";

interface DemoState {
  steps: DemoStepData[];
  highlight: string[];
  running: boolean;
  error: string | null;

  start: () => void;
  ingest: (event: DemoEvent) => void;
  finish: () => void;
  fail: (message: string) => void;
  reset: () => void;
}

export const useDemo = create<DemoState>((set) => ({
  steps: [],
  highlight: [],
  running: false,
  error: null,

  start: () => set({ steps: [], highlight: [], running: true, error: null }),

  ingest: (event) =>
    set((state) => {
      const highlight = event.highlight?.length ? event.highlight : state.highlight;

      // Streamed answer deltas merge into the matching step rather than
      // creating new steps.
      if (event.answer_delta) {
        const steps = state.steps.map((s) =>
          s.step === event.step
            ? { ...s, answer: (s.answer ?? "") + event.answer_delta }
            : s,
        );
        return { steps, highlight };
      }

      // Replace an existing step with the same number (e.g. GENERATE finalize),
      // otherwise append.
      const idx = state.steps.findIndex((s) => s.step === event.step);
      if (idx >= 0) {
        const steps = [...state.steps];
        steps[idx] = { ...steps[idx], ...event };
        return { steps, highlight };
      }
      return { steps: [...state.steps, event], highlight };
    }),

  finish: () => set({ running: false }),
  fail: (message) => set({ running: false, error: message }),
  reset: () => set({ steps: [], highlight: [], running: false, error: null }),
}));
