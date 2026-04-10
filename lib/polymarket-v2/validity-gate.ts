import type { SourceMarket } from "@/lib/event-replica/types";
import type { ValidityGateResult } from "./types";

export function runValidityGate(market: SourceMarket, now: Date): ValidityGateResult {
  const reasons: string[] = [];

  if (!market.externalId?.trim()) reasons.push("missing_external_id");
  if (!market.title?.trim()) reasons.push("missing_title");
  if (!market.sourceUrl?.trim()) reasons.push("missing_source_url");
  if (!(market.closeTime instanceof Date) || Number.isNaN(market.closeTime.getTime())) {
    reasons.push("invalid_close_time");
  } else if (market.closeTime <= now) {
    reasons.push("closed_market");
  }

  const outcomes = Array.isArray(market.outcomes) ? market.outcomes : [];
  if (outcomes.length < 2) reasons.push("insufficient_outcomes");
  const emptyLabel = outcomes.some((o) => !o.label?.trim());
  if (emptyLabel) reasons.push("invalid_outcome_label");

  if (!market.rulebook?.resolutionSourceUrl?.trim()) reasons.push("missing_resolution_source_url");
  if (!market.rulebook?.resolutionAuthorityHost?.trim()) reasons.push("missing_resolution_authority_host");

  return { ok: reasons.length === 0, reasons };
}
