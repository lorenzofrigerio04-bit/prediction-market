/**
 * The Odds API client.
 * Docs: https://the-odds-api.com/liveapi/guides/v4/
 *
 * Provides: pre-match and live odds from multiple bookmakers.
 * Used for: calibrating initial market probabilities, detecting line movements.
 *
 * Env: ODDS_API_KEY
 * Rate limit free tier: 500 req/month
 */

import type { MatchOdds, OddsMarket } from "../../types";

const BASE_URL = "https://api.the-odds-api.com/v4";

function getApiKey(): string {
  const key = process.env.ODDS_API_KEY?.trim();
  if (!key) {
    throw new Error("ODDS_API_KEY not configured. Get one at https://the-odds-api.com/");
  }
  return key;
}

// ---------------------------------------------------------------------------
// API response types
// ---------------------------------------------------------------------------

interface OddsApiOutcome {
  name: string;
  price: number;
  point?: number;
}

interface OddsApiMarket {
  key: string;
  last_update: string;
  outcomes: OddsApiOutcome[];
}

interface OddsApiBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: OddsApiMarket[];
}

interface OddsApiEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsApiBookmaker[];
}

interface OddsApiScore {
  name: string;
  score: string;
}

interface OddsApiScoreEvent {
  id: string;
  sport_key: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  completed: boolean;
  last_update: string | null;
  scores: OddsApiScore[] | null;
}

// ---------------------------------------------------------------------------
// Markets we care about
// ---------------------------------------------------------------------------

/** h2h = 1X2 moneyline, spreads = handicap, totals = over/under */
type OddsMarketKey = "h2h" | "spreads" | "totals";

const DEFAULT_MARKETS: OddsMarketKey[] = ["h2h", "spreads", "totals"];
const DEFAULT_REGIONS = "eu,uk";
const DEFAULT_ODDS_FORMAT = "decimal";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch odds for upcoming events in a given sport/league.
 * Each sport_key maps to a league (e.g. "soccer_italy_serie_a").
 */
export async function fetchOddsForSport(
  sportKey: string,
  options?: {
    markets?: OddsMarketKey[];
    regions?: string;
    dateFormat?: string;
  }
): Promise<MatchOdds[]> {
  const markets = options?.markets ?? DEFAULT_MARKETS;
  const regions = options?.regions ?? DEFAULT_REGIONS;

  const url = new URL(`${BASE_URL}/sports/${sportKey}/odds`);
  url.searchParams.set("apiKey", getApiKey());
  url.searchParams.set("regions", regions);
  url.searchParams.set("markets", markets.join(","));
  url.searchParams.set("oddsFormat", DEFAULT_ODDS_FORMAT);

  const res = await fetch(url.toString(), { cache: "no-store" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Odds API ${sportKey}: ${res.status} ${res.statusText} - ${text.slice(0, 300)}`);
  }

  const events: OddsApiEvent[] = await res.json();
  return events.map(mapToMatchOdds);
}

/**
 * Fetch all available soccer sports/leagues from The Odds API.
 * Useful for discovering which sport_keys are active.
 */
export async function fetchAvailableSoccerSports(): Promise<Array<{ key: string; title: string; active: boolean }>> {
  const url = new URL(`${BASE_URL}/sports`);
  url.searchParams.set("apiKey", getApiKey());

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Odds API sports list: ${res.status} - ${text.slice(0, 300)}`);
  }

  const sports: Array<{ key: string; group: string; title: string; active: boolean }> = await res.json();
  return sports
    .filter((s) => s.group === "Soccer" && s.active)
    .map(({ key, title, active }) => ({ key, title, active }));
}

/**
 * Fetch live/recent scores for a sport.
 * Useful for checking if a match has started or for live resolution.
 */
export async function fetchScores(
  sportKey: string,
  daysFrom?: number
): Promise<OddsApiScoreEvent[]> {
  const url = new URL(`${BASE_URL}/sports/${sportKey}/scores`);
  url.searchParams.set("apiKey", getApiKey());
  if (daysFrom != null) url.searchParams.set("daysFrom", String(daysFrom));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Odds API scores ${sportKey}: ${res.status} - ${text.slice(0, 300)}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

function mapToMatchOdds(event: OddsApiEvent): MatchOdds {
  const markets: OddsMarket[] = [];

  for (const bookmaker of event.bookmakers) {
    for (const market of bookmaker.markets) {
      markets.push({
        bookmaker: bookmaker.title,
        market: market.key,
        lastUpdate: market.last_update,
        outcomes: market.outcomes.map((o) => ({
          name: o.name,
          price: o.price,
        })),
      });
    }
  }

  return {
    matchId: event.id,
    homeTeam: event.home_team,
    awayTeam: event.away_team,
    commenceTime: event.commence_time,
    markets,
  };
}

/**
 * Extract consensus probability from bookmaker odds for a given outcome.
 * Averages the implied probability across all bookmakers for h2h market.
 * Returns 0-1 probability or null if insufficient data.
 */
export function extractConsensusProbability(
  odds: MatchOdds,
  outcomeName: string
): number | null {
  const h2hMarkets = odds.markets.filter((m) => m.market === "h2h");
  if (h2hMarkets.length === 0) return null;

  const impliedProbs: number[] = [];
  for (const market of h2hMarkets) {
    const outcome = market.outcomes.find(
      (o) => o.name.toLowerCase() === outcomeName.toLowerCase()
    );
    if (outcome && outcome.price > 1) {
      impliedProbs.push(1 / outcome.price);
    }
  }

  if (impliedProbs.length === 0) return null;

  const avg = impliedProbs.reduce((a, b) => a + b, 0) / impliedProbs.length;
  return Math.round(avg * 1000) / 1000;
}

/**
 * Detect significant line movements: compare earliest vs latest odds
 * for the same bookmaker. Returns movements > threshold.
 */
export function detectLineMovements(
  odds: MatchOdds,
  thresholdPercent: number = 5
): Array<{ bookmaker: string; outcome: string; oldPrice: number; newPrice: number; changePercent: number }> {
  const bookmakerSnapshots = new Map<string, { earliest: OddsMarket; latest: OddsMarket }>();

  for (const market of odds.markets.filter((m) => m.market === "h2h")) {
    const existing = bookmakerSnapshots.get(market.bookmaker);
    if (!existing) {
      bookmakerSnapshots.set(market.bookmaker, { earliest: market, latest: market });
    } else {
      if (market.lastUpdate < existing.earliest.lastUpdate) existing.earliest = market;
      if (market.lastUpdate > existing.latest.lastUpdate) existing.latest = market;
    }
  }

  const movements: Array<{ bookmaker: string; outcome: string; oldPrice: number; newPrice: number; changePercent: number }> = [];

  for (const [bookmaker, { earliest, latest }] of Array.from(bookmakerSnapshots.entries())) {
    if (earliest === latest) continue;
    for (const oldOutcome of earliest.outcomes) {
      const newOutcome = latest.outcomes.find((o) => o.name === oldOutcome.name);
      if (!newOutcome) continue;
      const oldProb = 1 / oldOutcome.price;
      const newProb = 1 / newOutcome.price;
      const changePercent = Math.abs(newProb - oldProb) * 100;
      if (changePercent >= thresholdPercent) {
        movements.push({
          bookmaker,
          outcome: oldOutcome.name,
          oldPrice: oldOutcome.price,
          newPrice: newOutcome.price,
          changePercent: Math.round(changePercent * 10) / 10,
        });
      }
    }
  }

  return movements;
}
