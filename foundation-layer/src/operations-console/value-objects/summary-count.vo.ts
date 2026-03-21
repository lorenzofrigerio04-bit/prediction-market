import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type SummaryCount = Branded<number, "SummaryCount">;

export const createSummaryCount = (value: number): SummaryCount => {
  if (!Number.isInteger(value) || value < 0) {
    throw new ValidationError("INVALID_SUMMARY_COUNT", "summary_count must be a non-negative integer");
  }
  return value as SummaryCount;
};
