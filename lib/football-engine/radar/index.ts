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
  TeamStanding,
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
import { fetchFixtureNewsSignals, fetchFloatingNewsSignals } from "./sources/news-rss";
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
/** Max H2H calls per run — only for top matches (1 API req each) */
const MAX_H2H_CALLS = 5;

// ---------------------------------------------------------------------------
// Season cache (avoid duplicate API calls for the same league)
// ---------------------------------------------------------------------------

const _seasonCache = new Map<number, number>();

/**
 * Fallback when API-Football cannot determine the current season.
 * Football seasons run Aug-May. API uses the start year.
 * April 2026 → month=3 < 7 → season = 2026-1 = 2025 (2025-2026 season).
 */
function getSeasonFallback(): number {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  const year = now.getFullYear();
  return month >= 7 ? year : year - 1;
}

async function getCurrentSeasonCached(leagueId: number): Promise<number> {
  if (_seasonCache.has(leagueId)) return _seasonCache.get(leagueId)!;
  const apiSeason = await safeCall(
    () => fetchCurrentSeason(leagueId),
    `season-${leagueId}`
  );
  const season = apiSeason ?? getSeasonFallback();
  _seasonCache.set(leagueId, season);
  return season;
}

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
    const season = await getCurrentSeasonCached(comp.apiFootballId!);

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
    const season = await getCurrentSeasonCached(comp.apiFootballId!);

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
// Cup competition IDs (no standings available for these)
// ---------------------------------------------------------------------------

const CUP_COMPETITION_IDS = new Set([
  "champions-league",
  "europa-league",
  "conference-league",
  "coppa-italia",
  "supercoppa-italiana",
  "fa-cup",
  "copa-del-rey",
  "dfb-pokal",
  "efl-cup",
  "nations-league",
  "wc-qualifiers-europe",
  "club-world-cup",
  "world-cup",
  "euro-championship",
  "copa-america",
]);

function isLeagueCompetition(comp: Competition): boolean {
  return !CUP_COMPETITION_IDS.has(comp.id);
}

// ---------------------------------------------------------------------------
// Core: fetch standings for league competitions
// ---------------------------------------------------------------------------

async function fetchAllStandings(
  competitions: Competition[]
): Promise<Map<string, TeamStanding>> {
  const standingsMap = new Map<string, TeamStanding>();

  const leagues = competitions
    .filter((c) => c.apiFootballId != null && isLeagueCompetition(c))
    .slice(0, 8);

  for (const comp of leagues) {
    const season = await getCurrentSeasonCached(comp.apiFootballId!);

    const standings = await safeCall(
      () => fetchStandings(comp.apiFootballId!, season),
      `standings ${comp.name}`
    );
    if (!standings) continue;

    for (const group of standings) {
      const normalized = normalizeStandings(group);
      for (const entry of normalized) {
        standingsMap.set(entry.teamId, entry);
      }
    }

    await sleep(300);
  }

  return standingsMap;
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

  // Signal density — news/social signals count more (3pts each vs 2pts for others)
  const newsSignals = signals.filter((s) => s.type === "news" || s.type === "social");
  const otherSignals = signals.filter((s) => s.type !== "news" && s.type !== "social");
  score += Math.min(20, newsSignals.length * 3);
  score += Math.min(15, otherSignals.length * 2);

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

/** Like withTimeout but resolves to empty array on timeout instead of rejecting */
async function withTimeoutSafe<T>(promise: Promise<T[]>, ms: number): Promise<T[]> {
  try {
    return await Promise.race([
      promise,
      new Promise<T[]>((resolve) => setTimeout(() => resolve([]), ms)),
    ]);
  } catch {
    return [];
  }
}

export interface RadarOptions {
  /** Max competition tier to include (1-4). Default: 2 */
  maxTier?: number;
  /** Whether to fetch odds (costs API quota). Default: true */
  fetchOddsEnabled?: boolean;
  /** Whether to fetch injuries. Default: true */
  fetchInjuriesEnabled?: boolean;
  /** Whether to fetch H2H for top matches. Default: true */
  fetchH2HEnabled?: boolean;
  /** Whether to fetch news/RSS signals. Default: true */
  fetchNewsEnabled?: boolean;
}

export async function runRadar(options?: RadarOptions): Promise<RadarOutput> {
  const maxTier = options?.maxTier ?? 2;
  const shouldFetchOdds = options?.fetchOddsEnabled ?? true;
  const shouldFetchInjuries = options?.fetchInjuriesEnabled ?? true;
  const shouldFetchH2H = options?.fetchH2HEnabled ?? true;
  const shouldFetchNews = options?.fetchNewsEnabled ?? true;

  const competitions = getCompetitionsByTier(maxTier);

  console.log(`[RADAR] Starting scan — ${competitions.length} competitions (tier ≤ ${maxTier})`);

  // Phase 1: Fetch fixtures + odds + injuries + standings + floating news in parallel
  const [fixturesResult, oddsMap, injuryData, standingsMap, floatingNews] = await Promise.all([
    fetchAllFixtures(competitions),
    shouldFetchOdds ? fetchAllOdds(competitions) : Promise.resolve(new Map()),
    shouldFetchInjuries
      ? fetchAllInjuries(competitions)
      : Promise.resolve({ signals: [] as FootballSignal[], byTeam: new Map<string, PlayerInfo[]>() }),
    fetchAllStandings(competitions),
    shouldFetchNews
      ? withTimeoutSafe(fetchFloatingNewsSignals(), 8000)
      : Promise.resolve([] as FootballSignal[]),
  ]);

  console.log(
    `[RADAR] Fetched: ${fixturesResult.fixtures.length} fixtures, ${oddsMap.size} odds, ${injuryData.signals.length} injuries, ${standingsMap.size} standings entries, ${floatingNews.length} floating news`
  );

  // Phase 2: Build MatchContext for each fixture (WITHOUT news — done after sort)
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

    // Standings lookup
    const homeStanding = standingsMap.get(match.homeTeam.id);
    const awayStanding = standingsMap.get(match.awayTeam.id);

    const interestScore = computeInterestScore(match, matchSignals, odds);

    // Extract themes from signals
    const themes = extractThemes(matchSignals);

    matches.push({
      match,
      signals: matchSignals,
      odds,
      h2h,
      homeStanding,
      awayStanding,
      homeInjuries,
      awayInjuries,
      interestScore,
      themes,
    });
  }

  // Sort by interest score (most interesting first)
  matches.sort((a, b) => b.interestScore - a.interestScore);

  // Phase 3: Fetch news ONLY for the top N matches (avoid N*100 RSS calls)
  const NEWS_FETCH_LIMIT = 8;
  if (shouldFetchNews) {
    const topMatches = matches.slice(0, NEWS_FETCH_LIMIT);
    console.log(`[RADAR] Fetching news for top ${topMatches.length} matches in parallel...`);

    // Parallel fetch with 4s timeout per fixture to cap total time
    const newsResults = await Promise.allSettled(
      topMatches.map((ctx) =>
        withTimeout(
          fetchFixtureNewsSignals(
            ctx.match.homeTeam.name,
            ctx.match.awayTeam.name,
            ctx.match.competition.name,
            ctx.match.utcDate
          ),
          4000
        )
      )
    );

    for (let i = 0; i < topMatches.length; i++) {
      const result = newsResults[i];
      if (result.status === "fulfilled" && result.value.length > 0) {
        topMatches[i].signals.push(...result.value);
        // Recompute interest score now that we have news signals
        topMatches[i].interestScore = computeInterestScore(
          topMatches[i].match,
          topMatches[i].signals,
          topMatches[i].odds
        );
        // Update themes
        topMatches[i].themes = extractThemes(topMatches[i].signals);
      }
    }

    // Re-sort after news enrichment
    matches.sort((a, b) => b.interestScore - a.interestScore);
    console.log(`[RADAR] News enrichment done.`);
  }

  console.log(
    `[RADAR] Built context for ${matches.length} matches. Top 3: ${matches
      .slice(0, 3)
      .map((m) => `${m.match.homeTeam.name} vs ${m.match.awayTeam.name} (${m.interestScore})`)
      .join(", ")}`
  );

  return {
    timestamp: new Date().toISOString(),
    matches,
    floatingSignals: floatingNews,
  };
}

/**
 * Wraps a promise with a max timeout. Resolves with the original value or
 * rejects with a timeout error if the promise takes too long.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
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
