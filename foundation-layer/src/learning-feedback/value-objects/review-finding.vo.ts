import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type ReviewFinding = Branded<string, "ReviewFinding">;

export const createReviewFinding = (value: string): ReviewFinding => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError("INVALID_REVIEW_FINDING", "review_finding must not be empty", { value });
  }
  return normalized as ReviewFinding;
};
