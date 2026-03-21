import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { RecommendationStatus } from "../../enums/recommendation-status.enum.js";
import type { CorrelationId } from "../../value-objects/correlation-id.vo.js";
import type { LearningRecommendationId } from "../../value-objects/learning-feedback-ids.vo.js";
import {
  createLearningRefList,
  createLearningText,
  type LearningRef,
  type LearningText,
} from "../../value-objects/learning-feedback-shared.vo.js";

export type LearningRecommendation = Readonly<{
  id: LearningRecommendationId;
  version: EntityVersion;
  correlation_id: CorrelationId;
  status: RecommendationStatus;
  recommendation_text: LearningText;
  blocking_dependency_refs: readonly LearningRef[];
  planned_action_refs: readonly LearningRef[];
  generated_at: Timestamp;
}>;

export const createLearningRecommendation = (
  input: LearningRecommendation,
): LearningRecommendation => {
  if (!Object.values(RecommendationStatus).includes(input.status)) {
    throw new ValidationError("INVALID_LEARNING_RECOMMENDATION", "status is invalid");
  }
  if (input.correlation_id.trim().length === 0) {
    throw new ValidationError("INVALID_LEARNING_RECOMMENDATION", "correlation_id is required");
  }
  const blocking_dependency_refs = createLearningRefList(
    input.blocking_dependency_refs,
    "blocking_dependency_refs",
  );
  const planned_action_refs = createLearningRefList(input.planned_action_refs, "planned_action_refs");
  if (input.status === RecommendationStatus.READY && blocking_dependency_refs.length > 0) {
    throw new ValidationError(
      "INVALID_LEARNING_RECOMMENDATION",
      "ready recommendation cannot have blocking_dependency_refs",
    );
  }
  return deepFreeze({
    ...input,
    recommendation_text: createLearningText(input.recommendation_text, "recommendation_text"),
    blocking_dependency_refs,
    planned_action_refs,
  });
};
