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
