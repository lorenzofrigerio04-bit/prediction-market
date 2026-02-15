import type { NewsCandidate } from "./types";
import { getConfigFromEnv } from "./types";
import { fetchNewsApiAiCandidates } from "./newsapi-ai";

/** Numero massimo di articoli per singola chiamata API (limite NewsAPI.ai) */
const MAX_ARTICLES_PER_REQUEST = 100;

/** Cache in-memory: una chiamata API riempie la cache, le richieste successive servono da qui (stesso processo). */
let cache: { at: number; data: NewsCandidate[] } | null = null;

/**
 * Recupera candidati (notizie) normalizzati. Efficiente: 1 chiamata API = fino a 100 notizie,
 * poi risposta dalla cache per tutta la finestra (default 1h). Ideale se chiamato da un solo
 * punto (es. cron 1 volta al giorno) per non sprecare token.
 *
 * @param limit - Numero massimo di candidati da restituire (default 50, max 100)
 * @returns Array di candidati ordinati per publishedAt (più recenti prima)
 */
export async function fetchTrendingCandidates(
  limit: number = 50
): Promise<NewsCandidate[]> {
  const config = getConfigFromEnv();
  const cacheTtl = config.cacheTtlSeconds ?? 0;
  const effectiveLimit = Math.min(Math.max(1, limit), MAX_ARTICLES_PER_REQUEST);

  if (cacheTtl > 0 && cache && Date.now() - cache.at < cacheTtl * 1000) {
    return cache.data.slice(0, effectiveLimit);
  }

  // Una sola chiamata: chiediamo sempre il massimo (100) per riempire la cache
  const newsCandidates = await fetchNewsApiAiCandidates(
    MAX_ARTICLES_PER_REQUEST,
    config
  );

  const seen = new Set<string>();
  const deduped = newsCandidates
    .filter((c) => {
      const key = c.url.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  if (cacheTtl > 0 && deduped.length > 0) {
    cache = { at: Date.now(), data: deduped };
  }

  return deduped.slice(0, effectiveLimit);
}

/** Esporta tipi e helper per uso esterno */
export type { NewsCandidate, EventSourcesConfig } from "./types";
export { getConfigFromEnv, DEFAULT_CONFIG } from "./types";
