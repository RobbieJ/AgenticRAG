"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Brand-consistent fallback UI for Next.js error boundaries. Keeps a presenter in
 * control when something throws: clear message, a retry that re-renders the
 * segment, and an escape hatch back to the demo list.
 */
export function ErrorState({
  reset,
  title = "Something went wrong",
  message = "The demo hit an unexpected error and stopped. Your session is safe — try running it again.",
  digest,
}: {
  reset?: () => void;
  title?: string;
  message?: string;
  digest?: string;
}) {
  return (
    <div className="mx-auto max-w-xl py-20 text-center" role="alert" aria-live="assertive">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-brand-tint text-brand">
        <AlertTriangle className="h-7 w-7" aria-hidden="true" />
      </div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{title}</h1>
      <p className="mt-2 leading-relaxed text-ink-muted">{message}</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        {reset && (
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 font-semibold text-white shadow-[0_6px_18px_-6px_rgba(238,0,0,0.6)] transition hover:bg-brand-dark"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
        )}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 font-semibold text-ink transition hover:bg-black/[0.04]"
        >
          Back to demos
        </Link>
      </div>
      {digest && (
        <p className="mt-4 font-mono text-xs text-ink-muted">ref: {digest}</p>
      )}
    </div>
  );
}
