import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { RecommendationStatus } from "../../enums/recommendation-status.enum.js";
import type { CorrelationId } from "../../value-objects/correlation-id.vo.js";
import type { LearningRecommendationId } from "../../value-objects/learning-feedback-ids.vo.js";
import { type LearningRef, type LearningText } from "../../value-objects/learning-feedback-shared.vo.js";
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
export declare const createLearningRecommendation: (input: LearningRecommendation) => LearningRecommendation;
//# sourceMappingURL=learning-recommendation.entity.d.ts.map