import type { NewsCandidate } from "./types";
import { getConfigFromEnv } from "./types";
import { fetchNewsApiCandidates } from "./news";

/** Cache in-memory (stateless per request; condivisa solo nello stesso processo) */
let cache: { at: number; data: NewsCandidate[] } | null = null;

/**
 * Recupera candidati da tutte le fonti configurate, normalizzati e filtrati.
 * Usabile dal pipeline (cron, route, script) senza toccare il DB.
 *
 * @param limit - Numero massimo di candidati da restituire (default 50)
 * @returns Array di candidati ordinati per publishedAt (più recenti prima)
 */
export async function fetchTrendingCandidates(
  limit: number = 50
): Promise<NewsCandidate[]> {
  const config = getConfigFromEnv();
  const cacheTtl = config.cacheTtlSeconds ?? 0;

  if (cacheTtl > 0 && cache && Date.now() - cache.at < cacheTtl * 1000) {
    return cache.data.slice(0, limit);
  }

  const all: NewsCandidate[] = [];

  // News API (sempre tentata se chiave presente)
  const newsCandidates = await fetchNewsApiCandidates(Math.ceil(limit * 1.2), config);
  all.push(...newsCandidates);

  // Altre fonti (GNews, RSS, Reddit) si aggiungono qui in futuro con stesso formato

  // Deduplica per URL, ordina per data (più recenti prima)
  const seen = new Set<string>();
  const deduped = all
    .filter((c) => {
      const key = c.url.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const result = deduped.slice(0, limit);
  const toCache = cacheTtl > 0 ? deduped.slice(0, 100) : [];
  if (cacheTtl > 0 && toCache.length > 0) {
    cache = { at: Date.now(), data: toCache };
  }

  return result;
}

/** Esporta tipi e helper per uso esterno */
export type { NewsCandidate, EventSourcesConfig } from "./types";
export { getConfigFromEnv, DEFAULT_CONFIG } from "./types";
