import type { Branded } from "../common/types/branded.js";
import { ValidationError } from "../common/errors/validation-error.js";
import { ConfidenceTier } from "../enums/confidence-tier.enum.js";

export type ConfidenceScore = Branded<number, "ConfidenceScore">;

export const createConfidenceScore = (value: number): ConfidenceScore => {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new ValidationError(
      "INVALID_CONFIDENCE_SCORE",
      "ConfidenceScore must be within [0,1]",
      { value },
    );
  }
  return value as ConfidenceScore;
};

export const toConfidenceTier = (score: ConfidenceScore): ConfidenceTier => {
  if (score < 0.34) {
    return ConfidenceTier.LOW;
  }
  if (score < 0.67) {
    return ConfidenceTier.MEDIUM;
  }
  return ConfidenceTier.HIGH;
};
