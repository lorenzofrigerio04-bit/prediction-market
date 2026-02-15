/**
 * Client per NewsAPI.ai (Event Registry).
 * Piano free: 2000 ricerche, fino a 100 articoli per ricerca, ultimi 30 giorni, uso in produzione consentito.
 * Doc: https://newsapi.ai/documentation (tab getArticles)
 */
import type { NewsCandidate } from "./types";
import {
  type EventSourcesConfig,
  getConfigFromEnv,
  isUrlBlacklisted,
  isWithinMaxAge,
} from "./types";

const EVENT_REGISTRY_BASE = "https://eventregistry.org/api/v1/article/getArticles";

/** Articolo nella risposta Event Registry (flat o dentro .info) */
type EventRegistryArticle = {
  uri?: string;
  title?: string | null;
  body?: string | null;
  url?: string | null;
  date?: string | null;
  dateTime?: string | null;
  time?: string | null;
  source?: { title?: string | null; uri?: string | null } | null;
  lang?: string | null;
  info?: {
    title?: string | null;
    body?: string | null;
    url?: string | null;
    date?: string | null;
    time?: string | null;
    source?: { title?: string | null; uri?: string | null } | null;
  };
};

/** Risposta getArticles (strutture possibili) */
type GetArticlesResponse = {
  articles?:
    | { results?: EventRegistryArticle[] }
    | Record<string, { info?: EventRegistryArticle["info"] }>;
  data?: { articles?: EventRegistryArticle[] };
  results?: EventRegistryArticle[];
};

function getApiKey(): string | undefined {
  return process.env.NEWS_API_KEY?.trim() || undefined;
}

async function fetchWithRetry(
  url: string,
  options: { timeoutMs: number; maxRetries: number; body: string }
): Promise<Response> {
  const { timeoutMs, maxRetries, body } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: controller.signal,
      });
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

function toPublishedAt(art: EventRegistryArticle): string | null {
  if (art.dateTime) return art.dateTime;
  if (art.date && art.time) return `${art.date}T${art.time}Z`;
  if (art.date) return `${art.date}T00:00:00Z`;
  return null;
}

function normalizeArticle(
  art: EventRegistryArticle,
  config: EventSourcesConfig
): NewsCandidate | null {
  const info = art.info ?? art;
  const title = (info.title ?? art.title)?.trim();
  const url = (info.url ?? art.url)?.trim();
  if (!title || !url) return null;

  const publishedAt = toPublishedAt(info as EventRegistryArticle) || toPublishedAt(art);
  if (!publishedAt) return null;
  if (!isWithinMaxAge(publishedAt, config.maxAgeHours)) return null;
  if (isUrlBlacklisted(url, config.domainBlacklist)) return null;

  const body = (info.body ?? art.body)?.trim();
  const snippet = body?.slice(0, 500) || title;
  const source = info.source ?? art.source;
  const sourceName = source?.title?.trim() || source?.uri?.trim() || "NewsAPI.ai";

  return {
    title,
    snippet,
    url,
    sourceName,
    publishedAt,
    rawCategory: undefined,
  };
}

function extractArticles(data: GetArticlesResponse): EventRegistryArticle[] {
  const raw = data.articles;
  if (raw?.results && Array.isArray(raw.results)) return raw.results;
  if (data.data?.articles && Array.isArray(data.data.articles))
    return data.data.articles;
  if (data.results && Array.isArray(data.results)) return data.results;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const entries = Object.values(raw) as Array<{ info?: EventRegistryArticle["info"] }>;
    return entries
      .filter((e) => e && typeof e === "object")
      .map((e) => ({ ...e.info, ...e } as EventRegistryArticle));
  }
  return [];
}

/**
 * Recupera candidati da NewsAPI.ai (Event Registry).
 * Usa NEWS_API_KEY; lingua ita, ultimi 31 giorni (free tier).
 */
export async function fetchNewsApiAiCandidates(
  limit: number,
  config?: EventSourcesConfig
): Promise<NewsCandidate[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("[event-sources/newsapi-ai] NEWS_API_KEY non configurata, skip");
    return [];
  }

  const cfg = config ?? getConfigFromEnv();
  const count = Math.min(Math.max(1, limit), 100);

  const body = JSON.stringify({
    action: "getArticles",
    apiKey,
    keyword: ["Italia", "politica", "sport", "tecnologia", "economia", "cronaca"],
    keywordOper: "or",
    lang: "ita",
    articlesCount: count,
    articlesSortBy: "date",
    articlesSortByAsc: false,
    forceMaxDataTimeWindow: 31,
    resultType: "articles",
    dataType: "news",
  });

  try {
    const res = await fetchWithRetry(EVENT_REGISTRY_BASE, {
      timeoutMs: cfg.timeoutMs,
      maxRetries: cfg.maxRetries,
      body,
    });

    const rawBody = await res.text();
    let data: GetArticlesResponse & { error?: string; code?: string };
    try {
      data = JSON.parse(rawBody) as GetArticlesResponse & { error?: string; code?: string };
    } catch {
      console.error("[event-sources/newsapi-ai] Risposta non JSON:", rawBody.slice(0, 200));
      return [];
    }

    if (!res.ok) {
      console.error(
        "[event-sources/newsapi-ai] HTTP",
        res.status,
        data.error ?? data.code ?? rawBody.slice(0, 200)
      );
      return [];
    }

    const articles = extractArticles(data);
    const candidates: NewsCandidate[] = [];
    for (const art of articles) {
      const c = normalizeArticle(art, cfg);
      if (c) candidates.push(c);
    }

    if (articles.length > 0) {
      console.info(
        `[event-sources/newsapi-ai] ${articles.length} articoli, ${candidates.length} candidati dopo filtri`
      );
    } else {
      console.warn("[event-sources/newsapi-ai] Nessun articolo in risposta");
    }

    return candidates;
  } catch (err) {
    console.error("[event-sources/newsapi-ai] Fetch failed:", err);
    return [];
  }
}
