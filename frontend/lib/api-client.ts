import { DemoEvent, DemoType, Health } from "./types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

/**
 * Stream a demo over Server-Sent Events. The backend exposes a GET endpoint
 * because the browser EventSource API only issues GET requests.
 *
 * Returns a stop() function the caller can use to cancel the stream.
 */
export function streamDemo(
  demoType: DemoType,
  query: string | undefined,
  mode: "agentic" | "classic",
  handlers: {
    onEvent: (event: DemoEvent) => void;
    onEnd?: () => void;
    onError?: (message: string) => void;
  },
): () => void {
  const params = new URLSearchParams({ demoType, mode });
  if (query) params.set("query", query);
  const url = `${BACKEND_URL}/demo/stream?${params.toString()}`;

  const source = new EventSource(url);

  source.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data) as DemoEvent & { phase?: string };
      if (data.phase === "ERROR") {
        handlers.onError?.(data.description || "Unknown error");
        source.close();
        return;
      }
      handlers.onEvent(data);
    } catch {
      // ignore malformed keep-alive frames
    }
  };

  // The server sends a named "end" event when the stream completes normally.
  source.addEventListener("end", () => {
    source.close();
    handlers.onEnd?.();
  });

  source.onerror = () => {
    // EventSource fires onerror on normal close too; only surface if still open.
    if (source.readyState !== EventSource.CLOSED) {
      handlers.onError?.("Lost connection to the backend.");
    }
    source.close();
    handlers.onEnd?.();
  };

  return () => source.close();
}

export async function fetchHealth(): Promise<Health | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Health;
  } catch {
    return null;
  }
}

export async function fetchExamples(): Promise<string[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/demo/examples`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.examples ?? [];
  } catch {
    return [];
  }
}
