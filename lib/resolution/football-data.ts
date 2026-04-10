/**
 * Risoluzione automatica eventi calcio tramite football-data.org.
 * Supporta:
 * - binary: vittoria squadra di casa (YES/NO)
 * - multiple choice: bucket gol totali (goals_0_1 | goals_2 | goals_3 | goals_4_plus)
 */

import {
  fetchMatchById,
  getBinaryOutcomeFromMatch,
} from "@/lib/football-data-org/client";
import type { AutoResolveResult } from "./auto-resolve";
import { MULTI_OPTION_MARKET_TYPES, isMarketTypeId } from "@/lib/market-types";

type SportEventResolutionInput = {
  footballDataMatchId: number;
  marketType?: string | null;
  templateId?: string | null;
  creationMetadata?: unknown;
};

function mapTotalGoalsToBucket(totalGoals: number): string {
  if (totalGoals <= 1) return "goals_0_1";
  if (totalGoals === 2) return "goals_2";
  if (totalGoals === 3) return "goals_3";
  return "goals_4_plus";
}

function isTotalGoalsMarket(event: SportEventResolutionInput): boolean {
  const meta =
    event.creationMetadata && typeof event.creationMetadata === "object"
      ? (event.creationMetadata as { sport_market_kind?: string })
      : null;
  return (
    event.templateId === "sport-football-total-goals" ||
    meta?.sport_market_kind === "TOTAL_GOALS_BUCKETS"
  );
}

function isFullTimeResult1X2Market(event: SportEventResolutionInput): boolean {
  const meta =
    event.creationMetadata && typeof event.creationMetadata === "object"
      ? (event.creationMetadata as { sport_market_kind?: string })
      : null;
  return (
    event.templateId === "sport-football-1x2"
    || meta?.sport_market_kind === "FULL_TIME_RESULT_1X2"
  );
}

function isBothTeamsToScoreMarket(event: SportEventResolutionInput): boolean {
  const meta =
    event.creationMetadata && typeof event.creationMetadata === "object"
      ? (event.creationMetadata as { sport_market_kind?: string })
      : null;
  return (
    event.templateId === "sport-football-btts"
    || meta?.sport_market_kind === "BOTH_TEAMS_TO_SCORE"
  );
}

function isOver25GoalsMarket(event: SportEventResolutionInput): boolean {
  const meta =
    event.creationMetadata && typeof event.creationMetadata === "object"
      ? (event.creationMetadata as { sport_market_kind?: string })
      : null;
  return (
    event.templateId === "sport-football-over-2-5"
    || meta?.sport_market_kind === "OVER_2_5_GOALS"
  );
}

function isMatchScript3WayMarket(event: SportEventResolutionInput): boolean {
  const meta =
    event.creationMetadata && typeof event.creationMetadata === "object"
      ? (event.creationMetadata as { sport_market_kind?: string })
      : null;
  return (
    event.templateId === "sport-football-match-script"
    || meta?.sport_market_kind === "MATCH_SCRIPT_3WAY"
  );
}

function isHalfTimeState3WayMarket(event: SportEventResolutionInput): boolean {
  const meta =
    event.creationMetadata && typeof event.creationMetadata === "object"
      ? (event.creationMetadata as { sport_market_kind?: string })
      : null;
  return (
    event.templateId === "sport-football-half-time-state"
    || meta?.sport_market_kind === "HALF_TIME_STATE_3WAY"
  );
}

function isMatchStaysCloseMarket(event: SportEventResolutionInput): boolean {
  const meta =
    event.creationMetadata && typeof event.creationMetadata === "object"
      ? (event.creationMetadata as { sport_market_kind?: string })
      : null;
  return (
    event.templateId === "sport-football-match-close"
    || meta?.sport_market_kind === "MATCH_STAYS_CLOSE"
  );
}

function isComebackSwapLeaderMarket(event: SportEventResolutionInput): boolean {
  const meta =
    event.creationMetadata && typeof event.creationMetadata === "object"
      ? (event.creationMetadata as { sport_market_kind?: string })
      : null;
  return (
    event.templateId === "sport-football-comeback-swap"
    || meta?.sport_market_kind === "COMEBACK_SWAP_LEADER"
  );
}

function isCleanSheetAnyMarket(event: SportEventResolutionInput): boolean {
  const meta =
    event.creationMetadata && typeof event.creationMetadata === "object"
      ? (event.creationMetadata as { sport_market_kind?: string })
      : null;
  return (
    event.templateId === "sport-football-clean-sheet-any"
    || meta?.sport_market_kind === "CLEAN_SHEET_ANY"
  );
}

/**
 * Risolve l'outcome di un evento sport (calcio) usando i dati partita football-data.org.
 */
export async function resolveSportEventByMatchId(
  event: SportEventResolutionInput
): Promise<AutoResolveResult> {
  try {
    const match = await fetchMatchById(event.footballDataMatchId);
    if (!match) {
      return { error: `Partita ${event.footballDataMatchId} non trovata` };
    }

    const isMultiOptionMarket =
      !!event.marketType &&
      isMarketTypeId(event.marketType) &&
      MULTI_OPTION_MARKET_TYPES.includes(event.marketType);

    if (isMultiOptionMarket && isTotalGoalsMarket(event)) {
      if (match.status !== "FINISHED") return { needsReview: true };
      const home = match.score?.fullTime?.home;
      const away = match.score?.fullTime?.away;
      if (home == null || away == null) {
        return { error: "Score finale non disponibile per mercato gol totali" };
      }
      const totalGoals = home + away;
      return { outcome: mapTotalGoalsToBucket(totalGoals) };
    }

    if (isMultiOptionMarket && isFullTimeResult1X2Market(event)) {
      if (match.status !== "FINISHED") return { needsReview: true };
      const winner = match.score?.winner;
      if (winner === "HOME_TEAM") return { outcome: "result_home" };
      if (winner === "DRAW") return { outcome: "result_draw" };
      if (winner === "AWAY_TEAM") return { outcome: "result_away" };
      return { error: "Winner finale non disponibile per mercato 1X2" };
    }

    if (isMultiOptionMarket && isMatchScript3WayMarket(event)) {
      if (match.status !== "FINISHED") return { needsReview: true };
      const home = match.score?.fullTime?.home;
      const away = match.score?.fullTime?.away;
      if (home == null || away == null) {
        return { error: "Score finale non disponibile per mercato match script" };
      }
      const diff = home - away;
      if (diff >= 2) return { outcome: "home_statement" };
      if (diff <= -2) return { outcome: "away_statement" };
      return { outcome: "balanced_battle" };
    }

    if (isMultiOptionMarket && isHalfTimeState3WayMarket(event)) {
      if (match.status !== "FINISHED") return { needsReview: true };
      const home = match.score?.halfTime?.home;
      const away = match.score?.halfTime?.away;
      if (home == null || away == null) {
        return { error: "Score halfTime non disponibile per mercato stato primo tempo" };
      }
      if (home > away) return { outcome: "ht_home_lead" };
      if (home < away) return { outcome: "ht_away_lead" };
      return { outcome: "ht_level" };
    }

    if (isBothTeamsToScoreMarket(event)) {
      if (match.status !== "FINISHED") return { needsReview: true };
      const home = match.score?.fullTime?.home;
      const away = match.score?.fullTime?.away;
      if (home == null || away == null) {
        return { error: "Score finale non disponibile per mercato BTTS" };
      }
      return { outcome: home > 0 && away > 0 ? "YES" : "NO" };
    }

    if (isOver25GoalsMarket(event)) {
      if (match.status !== "FINISHED") return { needsReview: true };
      const home = match.score?.fullTime?.home;
      const away = match.score?.fullTime?.away;
      if (home == null || away == null) {
        return { error: "Score finale non disponibile per mercato Over 2.5" };
      }
      return { outcome: home + away >= 3 ? "YES" : "NO" };
    }

    if (isMatchStaysCloseMarket(event)) {
      if (match.status !== "FINISHED") return { needsReview: true };
      const home = match.score?.fullTime?.home;
      const away = match.score?.fullTime?.away;
      if (home == null || away == null) {
        return { error: "Score finale non disponibile per mercato match close" };
      }
      return { outcome: Math.abs(home - away) <= 1 ? "YES" : "NO" };
    }

    if (isComebackSwapLeaderMarket(event)) {
      if (match.status !== "FINISHED") return { needsReview: true };
      const htHome = match.score?.halfTime?.home;
      const htAway = match.score?.halfTime?.away;
      const ftHome = match.score?.fullTime?.home;
      const ftAway = match.score?.fullTime?.away;
      if (htHome == null || htAway == null || ftHome == null || ftAway == null) {
        return { error: "Score halfTime/fullTime non disponibile per mercato ribaltone" };
      }
      const htDiff = htHome - htAway;
      const ftDiff = ftHome - ftAway;
      const outcome = htDiff !== 0 && ftDiff !== 0 && Math.sign(htDiff) !== Math.sign(ftDiff)
        ? "YES"
        : "NO";
      return { outcome };
    }

    if (isCleanSheetAnyMarket(event)) {
      if (match.status !== "FINISHED") return { needsReview: true };
      const home = match.score?.fullTime?.home;
      const away = match.score?.fullTime?.away;
      if (home == null || away == null) {
        return { error: "Score finale non disponibile per mercato clean sheet" };
      }
      return { outcome: home === 0 || away === 0 ? "YES" : "NO" };
    }

    const outcome = getBinaryOutcomeFromMatch(match);
    if (outcome === "YES" || outcome === "NO") return { outcome };
    if (match.status !== "FINISHED") {
      return { needsReview: true };
    }
    return { error: "Risultato non determinabile (score/winner mancante)" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: message };
  }
}
