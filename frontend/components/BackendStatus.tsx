"use client";

import { useEffect, useState } from "react";
import { fetchHealth } from "@/lib/api-client";
import { Health } from "@/lib/types";

export function BackendStatus() {
  const [health, setHealth] = useState<Health | null | "loading">("loading");

  useEffect(() => {
    fetchHealth().then(setHealth);
  }, []);

  if (health === "loading") return null;

  if (!health) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
        ● Backend offline — start it with{" "}
        <code>uvicorn backend.main:app --port 8000</code>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-green-500" /> Backend online
      </span>
      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
        provider: {health.provider}
      </span>
      {health.demo_mode ? (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">
          DEMO mode — deterministic offline answers (add credentials for the {health.provider} provider to go live)
        </span>
      ) : (
        <span className="rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-800">
          LIVE — {health.answer_model}
          {health.fast_model && health.fast_model !== health.answer_model
            ? ` · ${health.fast_model}`
            : ""}
        </span>
      )}
    </div>
  );
}
