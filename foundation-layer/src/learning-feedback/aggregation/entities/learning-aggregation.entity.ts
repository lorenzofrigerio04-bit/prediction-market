import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { AggregationStatus } from "../../enums/aggregation-status.enum.js";
import type { CorrelationId } from "../../value-objects/correlation-id.vo.js";
import type { LearningAggregationId } from "../../value-objects/learning-feedback-ids.vo.js";
import { createLearningRefList, type LearningRef } from "../../value-objects/learning-feedback-shared.vo.js";

export type LearningAggregation = Readonly<{
  id: LearningAggregationId;
  version: EntityVersion;
  correlation_id: CorrelationId;
  aggregation_status: AggregationStatus;
  input_signal_refs: readonly LearningRef[];
  aggregated_insight_refs: readonly LearningRef[];
  generated_at: Timestamp;
}>;

export const createLearningAggregation = (input: LearningAggregation): LearningAggregation => {
  if (!Object.values(AggregationStatus).includes(input.aggregation_status)) {
    throw new ValidationError("INVALID_LEARNING_AGGREGATION", "aggregation_status is invalid");
  }
  if (input.correlation_id.trim().length === 0) {
    throw new ValidationError("INVALID_LEARNING_AGGREGATION", "correlation_id is required");
  }
  const input_signal_refs = createLearningRefList(input.input_signal_refs, "input_signal_refs", 1);
  const aggregated_insight_refs = createLearningRefList(
    input.aggregated_insight_refs,
    "aggregated_insight_refs",
  );

  return deepFreeze({
    ...input,
    input_signal_refs,
    aggregated_insight_refs,
  });
};
