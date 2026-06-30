"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ErrorState";

// App-level error boundary: catches render/runtime errors in any page segment.
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled app error:", error);
  }, [error]);

  return <ErrorState reset={reset} digest={error.digest} />;
}
