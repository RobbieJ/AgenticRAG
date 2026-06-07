"use client";

import { create } from "zustand";
import { DemoStore, DemoEvent, DemoType } from "@/lib/types";

export const useDemo = create<DemoStore>((set) => ({
  currentStep: 0,
  highlightedElements: [],
  codeBlocks: [],
  executionResults: [],
  isExecuting: false,
  demoType: "what-is-ai",
  query: undefined,

  updateStep: (event: DemoEvent) =>
    set((state) => ({
      currentStep: event.step,
      highlightedElements: event.highlightDiagram || [],
      codeBlocks: event.codeBlock
        ? [...state.codeBlocks, event.codeBlock]
        : state.codeBlocks,
      executionResults: [...state.executionResults, event],
    })),

  reset: () =>
    set({
      currentStep: 0,
      highlightedElements: [],
      codeBlocks: [],
      executionResults: [],
      isExecuting: false,
    }),

  setDemoType: (type: DemoType) =>
    set({
      demoType: type,
      currentStep: 0,
      highlightedElements: [],
      codeBlocks: [],
      executionResults: [],
      isExecuting: false,
    }),

  setQuery: (query: string) =>
    set({
      query,
      currentStep: 0,
      highlightedElements: [],
      codeBlocks: [],
      executionResults: [],
    }),
}));
