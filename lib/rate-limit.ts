/**
 * Rate limiting in-memory (per instance).
 * Per serverless: ogni invocazione può avere il suo store; per IP è comunque utile.
 * Per produzione distribuita considerare Redis (es. @upstash/ratelimit).
 */

type WindowEntry = { count: number; resetAt: number };

const store = new Map<string, WindowEntry>();

const WINDOW_MS = 60 * 1000; // 1 minuto

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

/**
 * Controlla e incrementa il contatore per key (es. IP o userId).
 * @param key Identificatore (IP o userId)
 * @param limit Numero massimo di richieste nella finestra
 * @param windowMs Finestra in ms (default 60_000)
 * @returns null se OK, altrimenti { limit, remaining: 0, resetAt }
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number = WINDOW_MS
): { limit: number; remaining: number; resetAt: number } | null {
  const now = Date.now();
  if (store.size > 10000) cleanup();

  let entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return null; // OK
  }

  entry.count++;
  if (entry.count <= limit) return null;

  return {
    limit,
    remaining: 0,
    resetAt: entry.resetAt,
  };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
