import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type FeedbackConfidenceScore = Branded<number, "FeedbackConfidenceScore">;

export const createFeedbackConfidenceScore = (value: number): FeedbackConfidenceScore => {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new ValidationError("INVALID_FEEDBACK_CONFIDENCE_SCORE", "feedback confidence score must be within [0,1]", { value });
  }
  return value as FeedbackConfidenceScore;
};
