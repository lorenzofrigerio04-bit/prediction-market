import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type FeedbackTag = Branded<string, "FeedbackTag">;

export const createFeedbackTag = (value: string): FeedbackTag => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError("INVALID_FEEDBACK_TAG", "feedback_tag must not be empty", { value });
  }
  return normalized as FeedbackTag;
};
