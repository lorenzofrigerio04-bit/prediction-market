import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { PatternStatus } from "../../enums/pattern-status.enum.js";
import { OverrideType } from "../../enums/override-type.enum.js";
import type { OverridePatternId } from "../../value-objects/override-pattern-id.vo.js";
import { createLearningRefList, type LearningRef } from "../../value-objects/learning-feedback-shared.vo.js";

export type OverridePattern = Readonly<{
  id: OverridePatternId;
  status: PatternStatus;
  override_type: OverrideType;
  supporting_refs: readonly LearningRef[];
}>;

export const createOverridePattern = (input: OverridePattern): OverridePattern => {
  if (!Object.values(PatternStatus).includes(input.status)) {
    throw new ValidationError("INVALID_OVERRIDE_PATTERN", "status is invalid");
  }
  if (!Object.values(OverrideType).includes(input.override_type)) {
    throw new ValidationError("INVALID_OVERRIDE_PATTERN", "override_type is invalid");
  }
  return deepFreeze({
    ...input,
    supporting_refs: createLearningRefList(input.supporting_refs, "supporting_refs", 1),
  });
};
