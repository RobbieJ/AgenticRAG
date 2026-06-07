const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export interface DemoRequest {
  demoType: string;
  query?: string;
}

export async function executeDemoSSE(
  request: DemoRequest,
  onMessage: (event: any) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void
): Promise<void> {
  const queryParams = new URLSearchParams();
  queryParams.append("demoType", request.demoType);
  if (request.query) {
    queryParams.append("query", request.query);
  }

  const url = `${BACKEND_URL}/demo/execute?${queryParams.toString()}`;

  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          throw new Error(data.error);
        }
        onMessage(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        onError?.(error);
        eventSource.close();
        reject(error);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      onComplete?.();
      resolve();
    };
  });
}

export async function getDemoExamples(): Promise<any> {
  const response = await fetch(`${BACKEND_URL}/demo/examples`);
  if (!response.ok) {
    throw new Error("Failed to fetch examples");
  }
  return response.json();
}

export async function getDemoInfo(demoType: string): Promise<any> {
  const response = await fetch(`${BACKEND_URL}/demo/info/${demoType}`);
  if (!response.ok) {
    throw new Error("Failed to fetch demo info");
  }
  return response.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
