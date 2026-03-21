import { deepFreeze } from "../../common/utils/deep-freeze.js";
import { DiscoveryDedupeReason } from "../enums/discovery-dedupe-reason.enum.js";
import { DiscoveryDedupeDecisionType } from "../enums/discovery-dedupe-decision.enum.js";
import { DiscoveryDedupeOutcome } from "../enums/discovery-dedupe-outcome.enum.js";
import type { DiscoveryDedupeEvidenceStrength } from "../enums/discovery-dedupe-evidence-strength.enum.js";
import type { DiscoveryDedupeKey } from "../value-objects/discovery-dedupe-key.vo.js";

/** Legacy shape for evaluate(key, candidate, context). */
export type DiscoveryDedupeDecision = Readonly<{
  key: DiscoveryDedupeKey;
  decision: DiscoveryDedupeDecisionType;
  reason: DiscoveryDedupeReason;
}>;

/** V1 decision with full explainability (evaluateItem / evaluateSignal). */
export type DiscoveryDedupeDecisionV1 = Readonly<{
  outcome: DiscoveryDedupeOutcome;
  reason: DiscoveryDedupeReason;
  matchedKey: DiscoveryDedupeKey | null;
  matchedCandidateIdNullable: string | null;
  evidenceStrengthNullable: DiscoveryDedupeEvidenceStrength | null;
  foundWithinRun: boolean;
}>;

export const createDiscoveryDedupeDecision = (
  input: DiscoveryDedupeDecision,
): DiscoveryDedupeDecision => deepFreeze({ ...input });

export const createDiscoveryDedupeDecisionV1 = (
  input: DiscoveryDedupeDecisionV1,
): DiscoveryDedupeDecisionV1 =>
  deepFreeze({
    ...input,
    matchedKey: input.matchedKey ?? null,
    matchedCandidateIdNullable: input.matchedCandidateIdNullable ?? null,
    evidenceStrengthNullable: input.evidenceStrengthNullable ?? null,
  });
