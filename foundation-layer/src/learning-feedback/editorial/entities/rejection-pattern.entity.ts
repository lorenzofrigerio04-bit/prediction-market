import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { PatternStatus } from "../../enums/pattern-status.enum.js";
import type { RejectionPatternId } from "../../value-objects/rejection-pattern-id.vo.js";
import { createLearningRefList, type LearningRef } from "../../value-objects/learning-feedback-shared.vo.js";

export type RejectionPattern = Readonly<{
  id: RejectionPatternId;
  status: PatternStatus;
  reason_codes: readonly LearningRef[];
  supporting_refs: readonly LearningRef[];
}>;

export const createRejectionPattern = (input: RejectionPattern): RejectionPattern => {
  if (!Object.values(PatternStatus).includes(input.status)) {
    throw new ValidationError("INVALID_REJECTION_PATTERN", "status is invalid");
  }
  return deepFreeze({
    ...input,
    reason_codes: createLearningRefList(input.reason_codes, "reason_codes", 1),
    supporting_refs: createLearningRefList(input.supporting_refs, "supporting_refs", 1),
  });
};
