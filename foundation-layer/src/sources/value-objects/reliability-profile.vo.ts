import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
import { ConflictRiskLevel } from "../enums/conflict-risk-level.enum.js";
import { ResolutionEligibility } from "../enums/resolution-eligibility.enum.js";

export type ReliabilityProfile = Readonly<{
  authorityScore: number;
  historicalStabilityScore: number;
  resolutionEligibility: ResolutionEligibility;
  conflictRiskLevel: ConflictRiskLevel;
}>;

const assertUnitRange = (value: number, field: string): void => {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new ValidationError(
      "INVALID_RELIABILITY_SCORE",
      `${field} must be within [0,1]`,
      { field, value },
    );
  }
};

export const createReliabilityProfile = (input: ReliabilityProfile): ReliabilityProfile => {
  assertUnitRange(input.authorityScore, "authorityScore");
  assertUnitRange(input.historicalStabilityScore, "historicalStabilityScore");
  return deepFreeze({
    authorityScore: input.authorityScore,
    historicalStabilityScore: input.historicalStabilityScore,
    resolutionEligibility: input.resolutionEligibility,
    conflictRiskLevel: input.conflictRiskLevel,
  });
};
