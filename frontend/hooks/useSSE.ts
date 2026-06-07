"use client";

import { useEffect, useRef } from "react";
import { DemoEvent } from "@/lib/types";

export function useSSE(
  url: string,
  onMessage: (data: DemoEvent) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void
) {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          onError?.(new Error(data.error));
        } else {
          onMessage(data);
        }
      } catch (err) {
        onError?.(err as Error);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      onComplete?.();
    };

    eventSourceRef.current = eventSource;

    return () => {
      eventSource.close();
    };
  }, [url, onMessage, onError, onComplete]);

  return eventSourceRef.current;
}
