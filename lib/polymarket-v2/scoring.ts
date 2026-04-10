import type { SourceMarket } from "@/lib/event-replica/types";
import type { SoftScoreResult } from "./types";

export function scoreMarketSoft(market: SourceMarket): SoftScoreResult {
  const reasons: string[] = [];
  let score = 0.5;

  const rankValue = market.provenance.rankValue ?? 0;
  if (rankValue > 0) {
    score += Math.min(0.25, rankValue / 300_000);
    reasons.push("rank_signal");
  }

  if ((market.provenance.confidence ?? 0) >= 0.7) {
    score += 0.1;
    reasons.push("source_confidence");
  }

  if ((market.rulebook.edgeCases?.length ?? 0) > 0) {
    score += 0.05;
    reasons.push("edge_cases_present");
  }

  if ((market.outcomes?.length ?? 0) > 2) {
    score += 0.05;
    reasons.push("multi_outcome_richness");
  }

  if ((market.provenance.riskFlags?.length ?? 0) > 3) {
    score -= 0.1;
    reasons.push("high_risk_flags");
  }

  return { score: Math.max(0, Math.min(1, score)), reasons };
}
