import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { LearningInsightStatus } from "../../enums/learning-insight-status.enum.js";
import type { CorrelationId } from "../../value-objects/correlation-id.vo.js";
import type { LearningInsightId } from "../../value-objects/learning-feedback-ids.vo.js";
import {
  createLearningRefList,
  createLearningText,
  type LearningRef,
  type LearningText,
} from "../../value-objects/learning-feedback-shared.vo.js";

export type LearningInsight = Readonly<{
  id: LearningInsightId;
  version: EntityVersion;
  correlation_id: CorrelationId;
  insight_status: LearningInsightStatus;
  title: LearningText;
  supporting_refs: readonly LearningRef[];
  derived_recommendation_refs: readonly LearningRef[];
  created_at: Timestamp;
}>;

export const createLearningInsight = (input: LearningInsight): LearningInsight => {
  if (!Object.values(LearningInsightStatus).includes(input.insight_status)) {
    throw new ValidationError("INVALID_LEARNING_INSIGHT", "insight_status is invalid");
  }
  if (input.correlation_id.trim().length === 0) {
    throw new ValidationError("INVALID_LEARNING_INSIGHT", "correlation_id is required");
  }
  const supporting_refs = createLearningRefList(input.supporting_refs, "supporting_refs", 1);
  const derived_recommendation_refs = createLearningRefList(
    input.derived_recommendation_refs,
    "derived_recommendation_refs",
  );
  return deepFreeze({
    ...input,
    title: createLearningText(input.title, "title"),
    supporting_refs,
    derived_recommendation_refs,
  });
};
