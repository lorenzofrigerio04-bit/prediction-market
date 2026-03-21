import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { LearningCompatibilityStatus } from "../../enums/learning-compatibility-status.enum.js";
import { LearningCompatibilityTarget } from "../../enums/learning-compatibility-target.enum.js";
import type { CorrelationId } from "../../value-objects/correlation-id.vo.js";
import type { LearningCompatibilityResultId } from "../../value-objects/learning-feedback-ids.vo.js";
import {
  createLearningTextList,
  type LearningText,
} from "../../value-objects/learning-feedback-shared.vo.js";

export type LearningCompatibilityResult = Readonly<{
  id: LearningCompatibilityResultId;
  correlation_id: CorrelationId;
  target: LearningCompatibilityTarget;
  status: LearningCompatibilityStatus;
  mapped_artifact: Readonly<Record<string, unknown>>;
  notes: readonly LearningText[];
}>;

export const createLearningCompatibilityResult = (
  input: LearningCompatibilityResult,
): LearningCompatibilityResult => {
  if (!Object.values(LearningCompatibilityTarget).includes(input.target)) {
    throw new ValidationError("INVALID_LEARNING_COMPATIBILITY_RESULT", "target is invalid");
  }
  if (!Object.values(LearningCompatibilityStatus).includes(input.status)) {
    throw new ValidationError("INVALID_LEARNING_COMPATIBILITY_RESULT", "status is invalid");
  }
  if (input.correlation_id.trim().length === 0) {
    throw new ValidationError("INVALID_LEARNING_COMPATIBILITY_RESULT", "correlation_id is required");
  }
  return deepFreeze({
    ...input,
    mapped_artifact: deepFreeze({ ...input.mapped_artifact }),
    notes: createLearningTextList(input.notes, "notes"),
  });
};
