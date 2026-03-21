/**
 * Client per The Odds API.
 * Fetch quote h2h da bookmaker con cache 5 minuti.
 * Doc: https://the-odds-api.com/liveapi/guides/v4/
 */

const ODDS_API_BASE = "https://api.the-odds-api.com/v4";

export type OddsApiSport = {
  key: string;
  group: string;
  title: string;
  description?: string;
  active: boolean;
  has_outrights?: boolean;
};

export type OddsApiOutcome = {
  name: string;
  price: number;
};

export type OddsApiMarket = {
  key: string;
  last_update?: string;
  outcomes: OddsApiOutcome[];
};

export type OddsApiBookmaker = {
  key: string;
  title: string;
  last_update?: string;
  markets: OddsApiMarket[];
};

export type OddsApiEvent = {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsApiBookmaker[];
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minuti

type CacheEntry = {
  data: OddsApiEvent[];
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

function getApiKey(): string | undefined {
  return process.env.ODDS_API_KEY?.trim() || undefined;
}

function getCacheKey(sportKey: string): string {
  return `odds:${sportKey}`;
}

/**
 * Fetch odds per un sport_key. Usa cache in-memory con TTL 5 minuti.
 */
export async function fetchOddsForSport(
  sportKey: string,
  options?: { regions?: string; markets?: string }
): Promise<OddsApiEvent[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return [];
  }

  const cacheKey = getCacheKey(sportKey);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const params = new URLSearchParams({
    apiKey,
    regions: options?.regions ?? "eu",
    markets: options?.markets ?? "h2h",
    oddsFormat: "decimal",
  });

  const url = `${ODDS_API_BASE}/sports/${sportKey}/odds?${params}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 0 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(`[Odds API] ${sportKey}: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = (await res.json()) as OddsApiEvent[];
    cache.set(cacheKey, {
      data,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return data;
  } catch (err) {
    console.warn(`[Odds API] fetch error for ${sportKey}:`, err);
    return [];
  }
}

/**
 * Fetch odds per più sport in parallelo. Ritorna un Map sport_key -> eventi.
 */
export async function fetchOddsForSports(
  sportKeys: string[]
): Promise<Map<string, OddsApiEvent[]>> {
  const unique = [...new Set(sportKeys)].filter(Boolean);
  const results = await Promise.all(
    unique.map(async (key) => {
      const events = await fetchOddsForSport(key);
      return { key, events };
    })
  );
  return new Map(results.map((r) => [r.key, r.events]));
}

const SPORTS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 ora
let sportsCache: { data: OddsApiSport[]; expiresAt: number } | null = null;

/**
 * Fetch lista sport disponibili. Non consuma crediti Odds API.
 */
export async function fetchSports(options?: { all?: boolean }): Promise<OddsApiSport[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  if (sportsCache && Date.now() < sportsCache.expiresAt) {
    return sportsCache.data;
  }

  const params = new URLSearchParams({ apiKey });
  if (options?.all) params.set("all", "true");

  const url = `${ODDS_API_BASE}/sports?${params}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 0 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.warn("[Odds API] fetchSports:", res.status, res.statusText);
      return [];
    }
    const data = (await res.json()) as OddsApiSport[];
    sportsCache = { data, expiresAt: Date.now() + SPORTS_CACHE_TTL_MS };
    return data;
  } catch (err) {
    console.warn("[Odds API] fetchSports error:", err);
    return [];
  }
}
