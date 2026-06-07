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
      <div className="rounded-2xl border border-brand/20 bg-brand-tint px-4 py-2.5 text-xs font-medium text-brand-deep">
        ● Backend offline — start it with{" "}
        <code className="font-mono">uvicorn backend.main:app --port 8000</code>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white px-4 py-2.5 text-xs text-ink-soft shadow-card ring-1 ring-black/5">
      <span className="flex items-center gap-1.5 font-medium">
        <span className="h-2 w-2 rounded-full bg-emerald-500" /> Backend online
      </span>
      <span className="rounded-full bg-canvas px-2.5 py-0.5 font-medium text-ink-soft">
        provider: {health.provider}
      </span>
      {health.demo_mode ? (
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-medium text-amber-800">
          DEMO mode — deterministic offline answers (add credentials for {health.provider} to go live)
        </span>
      ) : (
        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-medium text-emerald-800">
          LIVE — {health.answer_model}
          {health.fast_model && health.fast_model !== health.answer_model
            ? ` · ${health.fast_model}`
            : ""}
        </span>
      )}
    </div>
  );
}
