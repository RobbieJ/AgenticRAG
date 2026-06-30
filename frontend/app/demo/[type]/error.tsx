"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ErrorState";

// Demo-segment error boundary: a crash inside a running demo recovers here
// without taking down the header or navigation.
export default function DemoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Demo error:", error);
  }, [error]);

  return (
    <ErrorState
      reset={reset}
      title="This demo hit an error"
      message="The demo stopped unexpectedly. Try running it again, or head back and pick another demo."
      digest={error.digest}
    />
  );
}
