/**
 * RADAR — Layer 1 of the Football Intelligence Engine.
 *
 * Orchestrates all data sources and produces a unified RadarOutput:
 * - Upcoming matches with full context (odds, H2H, injuries, standings, news)
 * - Floating signals not tied to a specific match (transfers, coach sackings, etc.)
 *
 * The output feeds into the BRAIN layer for event generation.
 */

import type {
  Competition,
  FootballSignal,
  Match,
  MatchContext,
  MatchOdds,
  PlayerInfo,
  RadarOutput,
} from "../types";
import { COMPETITIONS, getCompetitionsByTier } from "../competitions";
import {
  fetchFixtures,
  fetchInjuries,
  fetchH2H,
  fetchStandings,
  fetchCurrentSeason,
  type ApiFixture,
} from "./clients/api-football";
import { fetchOddsForSport, extractConsensusProbability } from "./clients/odds-api";
import {
  normalizeFixture,
  fixtureToSignal,
  injuryToSignal,
  injuryToPlayerInfo,
  normalizeStandings,
  normalizeH2H,
} from "./normalizers";
import { getApiSource, buildNewsSignalSource } from "./source-tiers";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/** Max leagues to query per run (to stay within rate limits) */
const MAX_LEAGUES_PER_RUN = 12;
/** Days ahead to look for fixtures */
const FIXTURE_DAYS_AHEAD = 14;
/** Max H2H calls per run (expensive, 1 req each) */
const MAX_H2H_CALLS = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeCall<T>(fn: () => Promise<T>, label: string): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.warn(`[RADAR] ${label} failed:`, err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Run async tasks with concurrency limit.
 */
async function mapConcurrent<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, idx: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

// ---------------------------------------------------------------------------
// Core: fetch fixtures for all target competitions
// ---------------------------------------------------------------------------

async function fetchAllFixtures(
  competitions: Competition[]
): Promise<{ fixtures: ApiFixture[]; errors: string[] }> {
  const now = new Date();
  const from = formatDate(now);
  const to = formatDate(new Date(now.getTime() + FIXTURE_DAYS_AHEAD * 24 * 60 * 60 * 1000));
  const errors: string[] = [];
  const allFixtures: ApiFixture[] = [];

  const leagues = competitions
    .filter((c) => c.apiFootballId != null)
    .slice(0, MAX_LEAGUES_PER_RUN);

  // Batch by 3 concurrent requests to respect rate limits (10 req/min on free)
  const results = await mapConcurrent(leagues, 3, async (comp) => {
    const season = await safeCall(
      () => fetchCurrentSeason(comp.apiFootballId!),
      `season ${comp.name}`
    );
    if (!season) return [];

    await sleep(200);
    const fixtures = await safeCall(
      () => fetchFixtures({ league: comp.apiFootballId!, season, from, to }),
      `fixtures ${comp.name}`
    );
    return fixtures ?? [];
  });

  for (const batch of results) {
    allFixtures.push(...batch);
  }

  // Sort by date
  allFixtures.sort(
    (a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
  );

  return { fixtures: allFixtures, errors };
}

// ---------------------------------------------------------------------------
// Core: enrich matches with odds
// ---------------------------------------------------------------------------

async function fetchAllOdds(
  competitions: Competition[]
): Promise<Map<string, MatchOdds>> {
  const oddsMap = new Map<string, MatchOdds>();

  const oddsLeagues = competitions.filter((c) => c.oddsApiKey);

  // Odds API: be conservative, max 5 leagues per run on free tier
  const toFetch = oddsLeagues.slice(0, 5);

  for (const comp of toFetch) {
    const odds = await safeCall(
      () => fetchOddsForSport(comp.oddsApiKey!),
      `odds ${comp.name}`
    );
    if (odds) {
      for (const o of odds) {
        // Key: "HomeTeam vs AwayTeam" normalized
        const key = `${o.homeTeam.toLowerCase()}|${o.awayTeam.toLowerCase()}`;
        oddsMap.set(key, o);
      }
    }
    await sleep(500);
  }

  return oddsMap;
}

// ---------------------------------------------------------------------------
// Core: fetch injuries for upcoming fixtures
// ---------------------------------------------------------------------------

async function fetchAllInjuries(
  competitions: Competition[]
): Promise<{ signals: FootballSignal[]; byTeam: Map<string, PlayerInfo[]> }> {
  const signals: FootballSignal[] = [];
  const byTeam = new Map<string, PlayerInfo[]>();

  const leagues = competitions
    .filter((c) => c.apiFootballId != null)
    .slice(0, 8);

  for (const comp of leagues) {
    const season = await safeCall(
      () => fetchCurrentSeason(comp.apiFootballId!),
      `injury-season ${comp.name}`
    );
    if (!season) continue;

    const injuries = await safeCall(
      () => fetchInjuries({ league: comp.apiFootballId!, season }),
      `injuries ${comp.name}`
    );
    if (!injuries) continue;

    for (const inj of injuries) {
      signals.push(injuryToSignal(inj));
      const teamKey = `team-${inj.team.id}`;
      const existing = byTeam.get(teamKey) ?? [];
      existing.push(injuryToPlayerInfo(inj));
      byTeam.set(teamKey, existing);
    }

    await sleep(300);
  }

  return { signals, byTeam };
}

// ---------------------------------------------------------------------------
// Score interest
// ---------------------------------------------------------------------------

function computeInterestScore(
  match: Match,
  signals: FootballSignal[],
  odds?: MatchOdds
): number {
  let score = 0;

  // Tier bonus
  score += match.competition.tier === 1 ? 30 : match.competition.tier === 2 ? 15 : 5;

  // Signal density
  score += Math.min(30, signals.length * 5);

  // Odds: closer odds = more interesting match
  if (odds) {
    const homeProb = extractConsensusProbability(odds, match.homeTeam.name);
    const awayProb = extractConsensusProbability(odds, match.awayTeam.name);
    if (homeProb != null && awayProb != null) {
      const closeness = 1 - Math.abs(homeProb - awayProb);
      score += Math.round(closeness * 20);
    }
  }

  // Time proximity: matches sooner are more interesting
  const hoursUntil = (new Date(match.utcDate).getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntil < 24) score += 20;
  else if (hoursUntil < 72) score += 10;

  return Math.min(100, score);
}

// ---------------------------------------------------------------------------
// Match name matching for odds
// ---------------------------------------------------------------------------

function findOddsForMatch(
  match: Match,
  oddsMap: Map<string, MatchOdds>
): MatchOdds | undefined {
  const key = `${match.homeTeam.name.toLowerCase()}|${match.awayTeam.name.toLowerCase()}`;
  if (oddsMap.has(key)) return oddsMap.get(key);

  // Fuzzy: try partial match
  for (const [oddsKey, odds] of Array.from(oddsMap.entries())) {
    const [oh, oa] = oddsKey.split("|");
    const homeName = match.homeTeam.name.toLowerCase();
    const awayName = match.awayTeam.name.toLowerCase();
    if (
      (homeName.includes(oh) || oh.includes(homeName)) &&
      (awayName.includes(oa) || oa.includes(awayName))
    ) {
      return odds;
    }
  }

  return undefined;
}

// ---------------------------------------------------------------------------
// Main: runRadar
// ---------------------------------------------------------------------------

export interface RadarOptions {
  /** Max competition tier to include (1-4). Default: 2 */
  maxTier?: number;
  /** Whether to fetch odds (costs API quota). Default: true */
  fetchOddsEnabled?: boolean;
  /** Whether to fetch injuries. Default: true */
  fetchInjuriesEnabled?: boolean;
  /** Whether to fetch H2H for top matches. Default: true */
  fetchH2HEnabled?: boolean;
}

export async function runRadar(options?: RadarOptions): Promise<RadarOutput> {
  const maxTier = options?.maxTier ?? 2;
  const shouldFetchOdds = options?.fetchOddsEnabled ?? true;
  const shouldFetchInjuries = options?.fetchInjuriesEnabled ?? true;
  const shouldFetchH2H = options?.fetchH2HEnabled ?? true;

  const competitions = getCompetitionsByTier(maxTier);

  console.log(`[RADAR] Starting scan — ${competitions.length} competitions (tier ≤ ${maxTier})`);

  // Phase 1: Fetch fixtures + odds + injuries in parallel
  const [fixturesResult, oddsMap, injuryData] = await Promise.all([
    fetchAllFixtures(competitions),
    shouldFetchOdds ? fetchAllOdds(competitions) : Promise.resolve(new Map()),
    shouldFetchInjuries
      ? fetchAllInjuries(competitions)
      : Promise.resolve({ signals: [] as FootballSignal[], byTeam: new Map<string, PlayerInfo[]>() }),
  ]);

  console.log(
    `[RADAR] Fetched: ${fixturesResult.fixtures.length} fixtures, ${oddsMap.size} odds, ${injuryData.signals.length} injuries`
  );

  // Phase 2: Build MatchContext for each fixture
  const matches: MatchContext[] = [];
  let h2hCalls = 0;

  for (const apiFixture of fixturesResult.fixtures) {
    const match = normalizeFixture(apiFixture);
    const fixtureSignal = fixtureToSignal(apiFixture);
    const matchSignals: FootballSignal[] = [fixtureSignal];

    // Add injury signals for this match's teams
    for (const teamId of [match.homeTeam.id, match.awayTeam.id]) {
      const teamInjurySignals = injuryData.signals.filter(
        (s) => s.teamIds?.includes(teamId)
      );
      matchSignals.push(...teamInjurySignals);
    }

    // Find odds
    const odds = findOddsForMatch(match, oddsMap);

    // Get injuries by team
    const homeInjuries = injuryData.byTeam.get(match.homeTeam.id) ?? [];
    const awayInjuries = injuryData.byTeam.get(match.awayTeam.id) ?? [];

    // H2H (limited calls)
    let h2h = undefined;
    if (shouldFetchH2H && h2hCalls < MAX_H2H_CALLS) {
      const homeApiId = parseInt(match.homeTeam.id.replace("team-", ""), 10);
      const awayApiId = parseInt(match.awayTeam.id.replace("team-", ""), 10);
      if (!isNaN(homeApiId) && !isNaN(awayApiId)) {
        const h2hFixtures = await safeCall(
          () => fetchH2H(homeApiId, awayApiId, 10),
          `H2H ${match.homeTeam.name} vs ${match.awayTeam.name}`
        );
        if (h2hFixtures) {
          h2h = normalizeH2H(h2hFixtures);
        }
        h2hCalls++;
        await sleep(300);
      }
    }

    const interestScore = computeInterestScore(match, matchSignals, odds);

    // Extract themes from signals
    const themes = extractThemes(matchSignals);

    matches.push({
      match,
      signals: matchSignals,
      odds,
      h2h,
      homeInjuries,
      awayInjuries,
      interestScore,
      themes,
    });
  }

  // Sort by interest score (most interesting first)
  matches.sort((a, b) => b.interestScore - a.interestScore);

  console.log(
    `[RADAR] Built context for ${matches.length} matches. Top 3: ${matches
      .slice(0, 3)
      .map((m) => `${m.match.homeTeam.name} vs ${m.match.awayTeam.name} (${m.interestScore})`)
      .join(", ")}`
  );

  return {
    timestamp: new Date().toISOString(),
    matches,
    floatingSignals: [],
  };
}

// ---------------------------------------------------------------------------
// Theme extraction
// ---------------------------------------------------------------------------

function extractThemes(signals: FootballSignal[]): string[] {
  const themes = new Set<string>();

  for (const s of signals) {
    if (s.type === "injury") themes.add("injuries");
    if (s.type === "suspension") themes.add("discipline");
    if (s.type === "transfer_rumor" || s.type === "transfer_official") themes.add("transfers");
    if (s.type === "coach_change") themes.add("coaching");
    if (s.type === "var_incident") themes.add("var");
    if (s.type === "discipline") themes.add("discipline");
    if (s.tags.includes("derby")) themes.add("rivalry");
  }

  if (themes.size === 0) themes.add("general");
  return Array.from(themes);
}
