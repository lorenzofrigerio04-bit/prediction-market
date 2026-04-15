/**
 * SENTINEL Oracle — 3-level resolution engine for sport events.
 *
 * Level 1 (Automatic): Match-based markets (1X2, BTTS, Over 2.5, etc.)
 *   Primary: football-data.org, Secondary: API-Football — cross-validated.
 *
 * Level 2 (Semi-automatic): Player/tactical markets (shots on target, scorer, etc.)
 *   Uses API-Football fixture stats. Always flags NEEDS_REVIEW with proposed outcome.
 *
 * Level 3 (Manual): Off-field markets (coach sacking, transfers)
 *   Searches Google News RSS for 3+ Tier 1-2 sources. Flags NEEDS_REVIEW.
 */

import { resolveSportEventByMatchId } from "@/lib/resolution/football-data";
import type { AutoResolveResult } from "@/lib/resolution/auto-resolve";
import {
  fetchFixtures,
  fetchFixtureEvents,
  fetchFixturePlayerStats,
  type ApiFixture,
  type ApiMatchEvent,
  type ApiPlayerFixtureStats,
} from "../radar/clients/api-football";
import { fetchFloatingNewsSignals } from "../radar/sources/news-rss";
import { classifySourceByDomain } from "../radar/source-tiers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OracleLevel = 1 | 2 | 3;

export interface OracleResult {
  level: OracleLevel;
  outcome?: string;
  needsReview: boolean;
  reason?: string;
  sources: string[];
  evidence?: Record<string, unknown>;
  error?: string;
}

export interface SportEventForOracle {
  id: string;
  title: string;
  closesAt: Date;
  resolutionBufferHours: number;
  footballDataMatchId: number | null;
  marketType: string | null;
  templateId: string | null;
  creationMetadata: Record<string, unknown> | null;
  matchStatus: string | null;
}

// ---------------------------------------------------------------------------
// Market kind classification
// ---------------------------------------------------------------------------

const L1_MARKET_KINDS = new Set([
  "FULL_TIME_RESULT_1X2",
  "BOTH_TEAMS_TO_SCORE",
  "OVER_2_5_GOALS",
  "CLEAN_SHEET_ANY",
  "TOTAL_GOALS_BUCKETS",
  "HALF_TIME_STATE_3WAY",
  "COMEBACK_SWAP_LEADER",
  "FIRST_GOAL_TIMING",
  "TOTAL_CARDS_RANGE",
  "MATCH_SCRIPT_3WAY",
  "MATCH_STAYS_CLOSE",
]);

const L2_MARKET_KINDS = new Set([
  "PLAYER_SHOTS_ON_TARGET",
  "PLAYER_ANYTIME_SCORER",
]);

const L3_MARKET_KINDS = new Set([
  "COACH_SACKING",
  "TRANSFER_OFFICIAL",
]);

export function classifyOracleLevel(sportMarketKind: string): OracleLevel {
  if (L1_MARKET_KINDS.has(sportMarketKind)) return 1;
  if (L2_MARKET_KINDS.has(sportMarketKind)) return 2;
  if (L3_MARKET_KINDS.has(sportMarketKind)) return 3;
  return 3; // unknown kinds default to manual review
}

export function getMarketKind(event: SportEventForOracle): string {
  const meta = event.creationMetadata;
  if (meta && typeof meta.sport_market_kind === "string") {
    return meta.sport_market_kind;
  }
  return "UNKNOWN";
}

// ---------------------------------------------------------------------------
// Level 1: Automatic (match result markets)
// ---------------------------------------------------------------------------

async function resolveLevel1(event: SportEventForOracle): Promise<OracleResult> {
  if (!event.footballDataMatchId) {
    return {
      level: 1,
      needsReview: true,
      reason: "No footballDataMatchId — cannot auto-resolve",
      sources: [],
    };
  }

  // Primary source: football-data.org
  const primaryResult = await resolveSportEventByMatchId({
    footballDataMatchId: event.footballDataMatchId,
    marketType: event.marketType,
    templateId: event.templateId,
    creationMetadata: event.creationMetadata,
  });

  if ("error" in primaryResult) {
    return {
      level: 1,
      needsReview: true,
      reason: `Primary source error: ${primaryResult.error}`,
      sources: ["football-data.org"],
      error: primaryResult.error,
    };
  }

  if ("needsReview" in primaryResult && primaryResult.needsReview) {
    return {
      level: 1,
      needsReview: true,
      reason: "Primary source returned needsReview (match not finished?)",
      sources: ["football-data.org"],
    };
  }

  const primaryOutcome = (primaryResult as { outcome: string }).outcome;

  // Secondary source: API-Football — cross-validate the score
  const secondaryResult = await crossValidateWithApiFootball(event, primaryOutcome);

  if (secondaryResult.disagrees) {
    return {
      level: 1,
      outcome: primaryOutcome,
      needsReview: true,
      reason: `Sources disagree: football-data.org=${primaryOutcome}, API-Football=${secondaryResult.apiFootballOutcome ?? "unknown"}`,
      sources: ["football-data.org", "api-football"],
      evidence: secondaryResult.evidence,
    };
  }

  return {
    level: 1,
    outcome: primaryOutcome,
    needsReview: false,
    sources: ["football-data.org", "api-football"],
    evidence: secondaryResult.evidence,
  };
}

interface CrossValidationResult {
  disagrees: boolean;
  apiFootballOutcome?: string;
  evidence?: Record<string, unknown>;
}

async function crossValidateWithApiFootball(
  event: SportEventForOracle,
  primaryOutcome: string
): Promise<CrossValidationResult> {
  const meta = event.creationMetadata;
  const apiFootballMatchId =
    (meta && typeof meta.api_football_match_id === "number"
      ? meta.api_football_match_id
      : null) ??
    extractApiFootballIdFromDedupKey(event);

  if (!apiFootballMatchId) {
    // Can't cross-validate — trust primary
    return { disagrees: false, evidence: { note: "No API-Football match ID for cross-validation" } };
  }

  try {
    const fixtures = await fetchFixtures({ id: apiFootballMatchId });
    if (!fixtures || fixtures.length === 0) {
      return { disagrees: false, evidence: { note: "API-Football fixture not found" } };
    }

    const fixture = fixtures[0];
    const status = fixture.fixture.status.short;

    if (!["FT", "AET", "PEN", "AWD", "WO"].includes(status)) {
      return { disagrees: false, evidence: { status, note: "Match not finished on API-Football" } };
    }

    const ftHome = fixture.score.fulltime.home;
    const ftAway = fixture.score.fulltime.away;
    const htHome = fixture.score.halftime.home;
    const htAway = fixture.score.halftime.away;

    const evidence: Record<string, unknown> = {
      apiFootballMatchId,
      status,
      fulltime: { home: ftHome, away: ftAway },
      halftime: { home: htHome, away: htAway },
    };

    if (ftHome == null || ftAway == null) {
      return { disagrees: false, evidence };
    }

    const marketKind = getMarketKind(event);
    const apiOutcome = computeOutcomeFromApiFootball(marketKind, fixture);

    if (apiOutcome && apiOutcome !== primaryOutcome) {
      return { disagrees: true, apiFootballOutcome: apiOutcome, evidence };
    }

    return { disagrees: false, evidence };
  } catch (err) {
    // Cross-validation failure is not fatal — trust primary
    return {
      disagrees: false,
      evidence: { error: err instanceof Error ? err.message : String(err) },
    };
  }
}

function computeOutcomeFromApiFootball(
  marketKind: string,
  fixture: ApiFixture
): string | null {
  const ftHome = fixture.score.fulltime.home;
  const ftAway = fixture.score.fulltime.away;
  const htHome = fixture.score.halftime.home;
  const htAway = fixture.score.halftime.away;

  if (ftHome == null || ftAway == null) return null;

  switch (marketKind) {
    case "FULL_TIME_RESULT_1X2":
      if (ftHome > ftAway) return "result_home";
      if (ftHome < ftAway) return "result_away";
      return "result_draw";

    case "BOTH_TEAMS_TO_SCORE":
      return ftHome > 0 && ftAway > 0 ? "YES" : "NO";

    case "OVER_2_5_GOALS":
      return ftHome + ftAway >= 3 ? "YES" : "NO";

    case "CLEAN_SHEET_ANY":
      return ftHome === 0 || ftAway === 0 ? "YES" : "NO";

    case "TOTAL_GOALS_BUCKETS": {
      const total = ftHome + ftAway;
      if (total <= 1) return "goals_0_1";
      if (total === 2) return "goals_2";
      if (total === 3) return "goals_3";
      return "goals_4_plus";
    }

    case "HALF_TIME_STATE_3WAY":
      if (htHome == null || htAway == null) return null;
      if (htHome > htAway) return "ht_home_lead";
      if (htHome < htAway) return "ht_away_lead";
      return "ht_level";

    case "COMEBACK_SWAP_LEADER":
      if (htHome == null || htAway == null) return null;
      return htHome !== htAway &&
        ftHome !== ftAway &&
        Math.sign(htHome - htAway) !== Math.sign(ftHome - ftAway)
        ? "YES"
        : "NO";

    case "MATCH_STAYS_CLOSE":
      return Math.abs(ftHome - ftAway) <= 1 ? "YES" : "NO";

    case "MATCH_SCRIPT_3WAY": {
      const diff = ftHome - ftAway;
      if (diff >= 2) return "home_statement";
      if (diff <= -2) return "away_statement";
      return "balanced_battle";
    }

    default:
      return null;
  }
}

function extractApiFootballIdFromDedupKey(event: SportEventForOracle): number | null {
  // dedupKey format: "fie:<apiFootballId>:<slug>"
  const meta = event.creationMetadata;
  if (!meta) return null;
  const sourceStorylineId = meta.source_storyline_id;
  if (typeof sourceStorylineId === "string" && sourceStorylineId.startsWith("fie:")) {
    const parts = sourceStorylineId.split(":");
    const id = parseInt(parts[1], 10);
    if (!isNaN(id)) return id;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Level 2: Semi-automatic (player performance markets)
// ---------------------------------------------------------------------------

async function resolveLevel2(event: SportEventForOracle): Promise<OracleResult> {
  const meta = event.creationMetadata;
  const apiFootballMatchId =
    (meta && typeof meta.api_football_match_id === "number"
      ? meta.api_football_match_id
      : null) ??
    extractApiFootballIdFromDedupKey(event);

  if (!apiFootballMatchId) {
    return {
      level: 2,
      needsReview: true,
      reason: "No API-Football match ID for player stats lookup",
      sources: [],
    };
  }

  try {
    const [events, playerStatsResponse] = await Promise.all([
      fetchFixtureEvents(apiFootballMatchId),
      fetchFixturePlayerStats(apiFootballMatchId),
    ]);

    const marketKind = getMarketKind(event);
    const proposedOutcome = computePlayerMarketOutcome(
      marketKind,
      event,
      events,
      playerStatsResponse
    );

    return {
      level: 2,
      outcome: proposedOutcome.outcome,
      needsReview: true, // L2 always needs admin review
      reason: proposedOutcome.reason,
      sources: ["api-football"],
      evidence: {
        matchId: apiFootballMatchId,
        playerStats: proposedOutcome.playerEvidence,
        matchEvents: events.length,
      },
    };
  } catch (err) {
    return {
      level: 2,
      needsReview: true,
      reason: `Failed to fetch player stats: ${err instanceof Error ? err.message : String(err)}`,
      sources: ["api-football"],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

interface PlayerOutcomeResult {
  outcome?: string;
  reason: string;
  playerEvidence?: Record<string, unknown>;
}

function computePlayerMarketOutcome(
  marketKind: string,
  event: SportEventForOracle,
  matchEvents: ApiMatchEvent[],
  playerStatsResponse: Array<{ team: { id: number; name: string }; players: ApiPlayerFixtureStats[] }>
): PlayerOutcomeResult {
  const allPlayers = playerStatsResponse.flatMap((t) => t.players);

  if (marketKind === "PLAYER_ANYTIME_SCORER") {
    const playerName = extractPlayerNameFromTitle(event.title);
    if (!playerName) {
      return { reason: "Could not extract player name from event title" };
    }

    const goals = matchEvents.filter(
      (e) =>
        e.type === "Goal" &&
        e.detail !== "Missed Penalty" &&
        normalizePlayerName(e.player.name).includes(normalizePlayerName(playerName))
    );

    const scored = goals.length > 0;
    return {
      outcome: scored ? "YES" : "NO",
      reason: `${playerName}: ${goals.length} goal(s) found in match events`,
      playerEvidence: {
        playerName,
        goalsFound: goals.length,
        goalDetails: goals.map((g) => ({
          minute: g.time.elapsed,
          detail: g.detail,
        })),
      },
    };
  }

  if (marketKind === "PLAYER_SHOTS_ON_TARGET") {
    const playerName = extractPlayerNameFromTitle(event.title);
    if (!playerName) {
      return { reason: "Could not extract player name from event title" };
    }

    const normalizedTarget = normalizePlayerName(playerName);
    const playerStat = allPlayers.find((p) =>
      normalizePlayerName(p.player.name).includes(normalizedTarget)
    );

    if (!playerStat || !playerStat.statistics[0]) {
      return {
        reason: `Player stats not found for "${playerName}"`,
        playerEvidence: { playerName, found: false },
      };
    }

    const shotsOn = playerStat.statistics[0].shots.on ?? 0;
    const threshold = extractThresholdFromTitle(event.title);

    if (threshold == null) {
      return {
        outcome: undefined,
        reason: `Could not extract threshold from title. Shots on target: ${shotsOn}`,
        playerEvidence: { playerName, shotsOnTarget: shotsOn },
      };
    }

    return {
      outcome: shotsOn > threshold ? "YES" : "NO",
      reason: `${playerName}: ${shotsOn} shots on target vs threshold ${threshold}`,
      playerEvidence: { playerName, shotsOnTarget: shotsOn, threshold },
    };
  }

  return { reason: `Unknown L2 market kind: ${marketKind}` };
}

function extractPlayerNameFromTitle(title: string): string | null {
  // Try common patterns: "Lautaro segnerà?", "Mbappé: almeno 2 tiri in porta?"
  // Look for capitalized proper nouns
  const namePatterns = [
    /^([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)\s*(?:segn|scor|tir|shot)/i,
    /([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)\s*(?::|\s+-\s+)/,
    /(?:di|of|by)\s+([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)/i,
  ];

  for (const pattern of namePatterns) {
    const match = title.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function extractThresholdFromTitle(title: string): number | null {
  const patterns = [
    /almeno\s+(\d+)/i,
    /più\s+di\s+(\d+)/i,
    /over\s+(\d+(?:\.\d+)?)/i,
    />\s*(\d+)/,
    /(\d+)\+?\s*tiri/i,
    /(\d+)\+?\s*shots/i,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match?.[1]) return parseFloat(match[1]);
  }

  return null;
}

function normalizePlayerName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// ---------------------------------------------------------------------------
// Level 3: Manual (off-field markets)
// ---------------------------------------------------------------------------

async function resolveLevel3(event: SportEventForOracle): Promise<OracleResult> {
  try {
    const signals = await fetchFloatingNewsSignals();

    const titleLower = event.title.toLowerCase();
    const keywords = titleLower
      .split(/[^a-zA-ZÀ-ÿ]+/)
      .filter((w) => w.length > 3);

    const relevantSignals = signals.filter((s) => {
      const headlineLower = s.headline.toLowerCase();
      return keywords.some((kw) => headlineLower.includes(kw));
    });

    const tier1or2Sources = relevantSignals.filter((s) => s.source.tier <= 2);

    const uniqueSourceNames = new Set(tier1or2Sources.map((s) => s.source.name));

    if (uniqueSourceNames.size >= 3) {
      const marketKind = getMarketKind(event);
      const proposedOutcome = marketKind === "COACH_SACKING" || marketKind === "TRANSFER_OFFICIAL"
        ? "YES"
        : undefined;

      return {
        level: 3,
        outcome: proposedOutcome,
        needsReview: true,
        reason: `${uniqueSourceNames.size} Tier 1-2 sources found confirming. Proposed: ${proposedOutcome ?? "review needed"}`,
        sources: Array.from(uniqueSourceNames),
        evidence: {
          signalCount: relevantSignals.length,
          tier1or2Count: tier1or2Sources.length,
          uniqueSources: Array.from(uniqueSourceNames),
          sampleHeadlines: tier1or2Sources.slice(0, 5).map((s) => s.headline),
        },
      };
    }

    return {
      level: 3,
      needsReview: uniqueSourceNames.size > 0,
      reason: `Only ${uniqueSourceNames.size} Tier 1-2 source(s) found — need 3+ for proposal`,
      sources: Array.from(uniqueSourceNames),
      evidence: {
        signalCount: relevantSignals.length,
        tier1or2Count: tier1or2Sources.length,
        keywords: keywords.slice(0, 10),
      },
    };
  } catch (err) {
    return {
      level: 3,
      needsReview: false,
      reason: `Failed to search news: ${err instanceof Error ? err.message : String(err)}`,
      sources: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check if an event's resolution buffer has elapsed.
 * An event can only be resolved after closesAt + resolutionBufferHours.
 */
export function isBufferElapsed(event: SportEventForOracle): boolean {
  const bufferMs = (event.resolutionBufferHours ?? 24) * 60 * 60 * 1000;
  const resolveAfter = new Date(event.closesAt.getTime() + bufferMs);
  return new Date() >= resolveAfter;
}

/**
 * Main Oracle entry point: resolves a single sport event.
 * Routes to L1/L2/L3 based on sport_market_kind.
 */
export async function resolveEvent(event: SportEventForOracle): Promise<OracleResult> {
  const marketKind = getMarketKind(event);
  const level = classifyOracleLevel(marketKind);

  console.log(
    `[SENTINEL/oracle] Resolving event ${event.id} — kind=${marketKind} level=L${level} title="${event.title.slice(0, 60)}"`
  );

  try {
    switch (level) {
      case 1:
        return await resolveLevel1(event);
      case 2:
        return await resolveLevel2(event);
      case 3:
        return await resolveLevel3(event);
      default:
        return {
          level: 3,
          needsReview: true,
          reason: `Unknown oracle level for market kind: ${marketKind}`,
          sources: [],
        };
    }
  } catch (err) {
    console.error(`[SENTINEL/oracle] Error resolving event ${event.id}:`, err);
    return {
      level,
      needsReview: true,
      reason: `Oracle error: ${err instanceof Error ? err.message : String(err)}`,
      sources: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
