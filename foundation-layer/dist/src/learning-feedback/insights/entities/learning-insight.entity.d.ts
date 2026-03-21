import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { LearningInsightStatus } from "../../enums/learning-insight-status.enum.js";
import type { CorrelationId } from "../../value-objects/correlation-id.vo.js";
import type { LearningInsightId } from "../../value-objects/learning-feedback-ids.vo.js";
import { type LearningRef, type LearningText } from "../../value-objects/learning-feedback-shared.vo.js";
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
export declare const createLearningInsight: (input: LearningInsight) => LearningInsight;
//# sourceMappingURL=learning-insight.entity.d.ts.map