"use client";

import { create } from "zustand";
import { DemoEvent, DemoStepData } from "@/lib/types";

export type Track = "agentic" | "classic";

interface DemoState {
  agentic: DemoStepData[];
  classic: DemoStepData[];
  highlight: string[];
  running: boolean;
  activeTrack: Track;
  error: string | null;

  startRun: (track: Track) => void;
  ingest: (track: Track, event: DemoEvent) => void;
  finish: () => void;
  fail: (message: string) => void;
  resetAll: () => void;
}

function merge(steps: DemoStepData[], event: DemoEvent): DemoStepData[] {
  // Streamed answer deltas accumulate into the matching step.
  if (event.answer_delta) {
    return steps.map((s) =>
      s.step === event.step
        ? { ...s, answer: (s.answer ?? "") + event.answer_delta }
        : s,
    );
  }
  const idx = steps.findIndex((s) => s.step === event.step);
  if (idx >= 0) {
    const next = [...steps];
    next[idx] = { ...next[idx], ...event };
    return next;
  }
  return [...steps, event];
}

export const useDemo = create<DemoState>((set) => ({
  agentic: [],
  classic: [],
  highlight: [],
  running: false,
  activeTrack: "agentic",
  error: null,

  startRun: (track) =>
    set((state) => ({
      running: true,
      error: null,
      activeTrack: track,
      highlight: [],
      // clear only the track that's (re)starting
      agentic: track === "agentic" ? [] : state.agentic,
      classic: track === "classic" ? [] : state.classic,
    })),

  ingest: (track, event) =>
    set((state) => {
      const highlight = event.highlight?.length ? event.highlight : state.highlight;
      if (track === "classic") {
        return { classic: merge(state.classic, event), highlight };
      }
      return { agentic: merge(state.agentic, event), highlight };
    }),

  finish: () => set({ running: false }),
  fail: (message) => set({ running: false, error: message }),
  resetAll: () =>
    set({ agentic: [], classic: [], highlight: [], running: false, error: null, activeTrack: "agentic" }),
}));
