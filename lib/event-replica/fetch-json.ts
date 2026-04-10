export async function fetchJsonWithRetry<T>(
  url: string,
  options: {
    timeoutMs: number;
    retryCount: number;
    headers?: Record<string, string>;
    /** Called on each attempt (e.g. fresh Kalshi signature + timestamp on retry). */
    getHeaders?: () => Record<string, string>;
  }
): Promise<T> {
  let lastErr: unknown = null;

  for (let attempt = 0; attempt <= options.retryCount; attempt++) {
    try {
      const extra = options.getHeaders?.() ?? options.headers ?? {};
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...extra,
        },
        signal: AbortSignal.timeout(options.timeoutMs),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      return (await res.json()) as T;
    } catch (error) {
      lastErr = error;
      if (attempt < options.retryCount) {
        await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
      }
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}
