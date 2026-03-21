import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { AggregationStatus } from "../../enums/aggregation-status.enum.js";
import type { CorrelationId } from "../../value-objects/correlation-id.vo.js";
import type { LearningAggregationId } from "../../value-objects/learning-feedback-ids.vo.js";
import { type LearningRef } from "../../value-objects/learning-feedback-shared.vo.js";
export type LearningAggregation = Readonly<{
    id: LearningAggregationId;
    version: EntityVersion;
    correlation_id: CorrelationId;
    aggregation_status: AggregationStatus;
    input_signal_refs: readonly LearningRef[];
    aggregated_insight_refs: readonly LearningRef[];
    generated_at: Timestamp;
}>;
export declare const createLearningAggregation: (input: LearningAggregation) => LearningAggregation;
//# sourceMappingURL=learning-aggregation.entity.d.ts.map