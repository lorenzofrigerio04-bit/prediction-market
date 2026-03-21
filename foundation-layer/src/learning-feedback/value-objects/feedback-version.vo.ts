import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type FeedbackVersion = Branded<number, "FeedbackVersion">;

export const createFeedbackVersion = (value: number): FeedbackVersion => {
  if (!Number.isInteger(value) || value < 1) {
    throw new ValidationError("INVALID_FEEDBACK_VERSION", "feedback version must be an integer >= 1", { value });
  }
  return value as FeedbackVersion;
};
