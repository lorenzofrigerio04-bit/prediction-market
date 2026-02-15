import type { NewsCandidate } from "./types";
import {
  type EventSourcesConfig,
  getConfigFromEnv,
  isUrlBlacklisted,
  isWithinMaxAge,
} from "./types";

const NEWS_API_BASE = "https://newsapi.org/v2";

/** Risposta articolo News API (everything) */
type NewsApiArticle = {
  source?: { id?: string | null; name?: string | null };
  author?: string | null;
  title?: string | null;
  description?: string | null;
  url?: string | null;
  publishedAt?: string | null;
  content?: string | null;
};

type NewsApiResponse = {
  status?: string;
  totalResults?: number;
  articles?: NewsApiArticle[];
};

function getApiKey(): string | undefined {
  return process.env.NEWS_API_KEY?.trim() || undefined;
}

/** Fetch con timeout e retry con backoff esponenziale */
async function fetchWithRetry(
  url: string,
  options: { timeoutMs: number; maxRetries: number }
): Promise<Response> {
  const { timeoutMs, maxRetries } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      return res;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  throw lastError ?? new Error("fetchWithRetry failed");
}

/** Normalizza un articolo News API in NewsCandidate */
function normalizeArticle(article: NewsApiArticle, config: EventSourcesConfig): NewsCandidate | null {
  const title = article.title?.trim();
  const url = article.url?.trim();
  if (!title || !url) return null;

  const snippet =
    article.description?.trim() ||
    article.content?.trim()?.slice(0, 300) ||
    title;
  const sourceName =
    article.source?.name?.trim() || article.source?.id?.trim() || "News API";
  const publishedAt = article.publishedAt?.trim();
  if (!publishedAt) return null;

  if (!isWithinMaxAge(publishedAt, config.maxAgeHours)) return null;
  if (isUrlBlacklisted(url, config.domainBlacklist)) return null;

  return {
    title,
    snippet: snippet.slice(0, 500),
    url,
    sourceName,
    publishedAt,
    rawCategory: undefined, // everything non fornisce category; top-headlines sì (fase successiva)
  };
}

/**
 * Recupera candidati dalla News API (everything, lingua IT, ultime N ore).
 * In caso di errore logga e restituisce array vuoto (graceful degradation).
 */
export async function fetchNewsApiCandidates(
  limit: number,
  config?: EventSourcesConfig
): Promise<NewsCandidate[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("[event-sources/news] NEWS_API_KEY non configurata, skip News API");
    return [];
  }

  const cfg = config ?? getConfigFromEnv();
  const from = new Date(Date.now() - cfg.maxAgeHours * 60 * 60 * 1000).toISOString();

  const params = new URLSearchParams({
    apiKey,
    language: cfg.language,
    from,
    sortBy: "publishedAt",
    pageSize: String(Math.min(limit, 100)),
    q: "news OR Italia OR politica OR sport OR tecnologia OR economia",
  });

  const url = `${NEWS_API_BASE}/everything?${params.toString()}`;

  try {
    const res = await fetchWithRetry(url, {
      timeoutMs: cfg.timeoutMs,
      maxRetries: cfg.maxRetries,
    });

    const rawBody = await res.text();
    let data: NewsApiResponse;
    try {
      data = JSON.parse(rawBody) as NewsApiResponse;
    } catch {
      console.error("[event-sources/news] News API risposta non JSON:", rawBody.slice(0, 200));
      return [];
    }

    if (!res.ok) {
      const errMsg = (data as { message?: string }).message ?? rawBody.slice(0, 300);
      console.error(
        `[event-sources/news] News API HTTP ${res.status}: ${errMsg}`
      );
      return [];
    }

    if (data.status !== "ok" || !Array.isArray(data.articles)) {
      const code = (data as { code?: string }).code;
      console.warn(
        "[event-sources/news] News API risposta inattesa:",
        data.status,
        code ? `code=${code}` : "",
        (data as { message?: string }).message ?? ""
      );
      return [];
    }

    const candidates: NewsCandidate[] = [];
    for (const art of data.articles) {
      const c = normalizeArticle(art, cfg);
      if (c) candidates.push(c);
      if (candidates.length >= limit) break;
    }

    if (candidates.length === 0 && data.articles.length > 0) {
      console.warn(
        `[event-sources/news] News API ha restituito ${data.articles.length} articoli ma 0 passano i filtri (maxAge=${cfg.maxAgeHours}h, blacklist). Prova EVENT_SOURCES_MAX_AGE_HOURS=168`
      );
    } else if (data.articles.length === 0) {
      console.warn(
        "[event-sources/news] News API totalResults=",
        data.totalResults ?? 0,
        "- nessun articolo nel periodo. Piano free ha ritardo 24h; prova EVENT_SOURCES_MAX_AGE_HOURS=168"
      );
    } else {
      console.info(
        `[event-sources/news] News API: ${data.articles.length} articoli, ${candidates.length} candidati dopo filtri`
      );
    }

    return candidates;
  } catch (err) {
    console.error("[event-sources/news] News API fetch failed:", err);
    return [];
  }
}
