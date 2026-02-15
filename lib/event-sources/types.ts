/**
 * Formato unificato per un candidato evento (notizia/trend) da qualsiasi fonte.
 * Usato dal pipeline per poi eventualmente creare Event nel DB.
 */
export type NewsCandidate = {
  title: string;
  snippet: string;
  url: string;
  sourceName: string;
  publishedAt: string; // ISO 8601
  rawCategory?: string;
};

/** Configurazione condivisa per le fonti (timeout, retry, lingua, ecc.) */
export type EventSourcesConfig = {
  /** Timeout HTTP in ms */
  timeoutMs: number;
  /** Numero massimo di retry per una singola richiesta */
  maxRetries: number;
  /** Lingua richiesta (es. "it") */
  language: string;
  /** Ore indietro per filtrare (es. 48 = ultime 48 ore) */
  maxAgeHours: number;
  /** Domini da escludere (hostname, es. "example.com") */
  domainBlacklist: string[];
  /** TTL cache in secondi (0 = disabilitata) */
  cacheTtlSeconds: number;
};

/** Default: italiano, ultime 7 giorni (piano free News API ha ritardo 24h), blacklist minima */
export const DEFAULT_CONFIG: EventSourcesConfig = {
  timeoutMs: 25000,
  maxRetries: 3,
  language: "it",
  maxAgeHours: 168,
  domainBlacklist: [
    "example.com",
    "test.com",
    "localhost",
  ],
  cacheTtlSeconds: 3600, // 1 ora: una chiamata API = fino a 100 notizie, poi si serve dalla cache
};

/** Legge config da env con fallback su default */
export function getConfigFromEnv(): EventSourcesConfig {
  return {
    timeoutMs: parseInt(process.env.EVENT_SOURCES_TIMEOUT_MS ?? "", 10) || DEFAULT_CONFIG.timeoutMs,
    maxRetries: parseInt(process.env.EVENT_SOURCES_MAX_RETRIES ?? "", 10) || DEFAULT_CONFIG.maxRetries,
    language: process.env.EVENT_SOURCES_LANGUAGE ?? DEFAULT_CONFIG.language,
    maxAgeHours: parseInt(process.env.EVENT_SOURCES_MAX_AGE_HOURS ?? "", 10) || DEFAULT_CONFIG.maxAgeHours,
    domainBlacklist: DEFAULT_CONFIG.domainBlacklist,
    cacheTtlSeconds: parseInt(process.env.EVENT_SOURCES_CACHE_TTL ?? "", 10) ?? DEFAULT_CONFIG.cacheTtlSeconds,
  };
}

/** Verifica se l'URL ha host in blacklist */
export function isUrlBlacklisted(url: string, blacklist: string[]): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return blacklist.some((d) => host === d.toLowerCase() || host.endsWith("." + d.toLowerCase()));
  } catch {
    return true; // URL non valido → escludi
  }
}

/** Verifica se publishedAt è entro maxAgeHours da ora */
export function isWithinMaxAge(publishedAt: string, maxAgeHours: number): boolean {
  const published = new Date(publishedAt).getTime();
  const cutoff = Date.now() - maxAgeHours * 60 * 60 * 1000;
  return published >= cutoff;
}
