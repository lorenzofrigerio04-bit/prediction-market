import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type NonEmptySummary = Branded<string, "NonEmptySummary">;

export const createNonEmptySummary = (value: string): NonEmptySummary => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError("INVALID_SUMMARY", "QualityReport.summary must not be empty");
  }
  return normalized as NonEmptySummary;
};
