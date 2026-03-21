import { LearningCompatibilityStatus } from "../../enums/learning-compatibility-status.enum.js";
import { LearningCompatibilityTarget } from "../../enums/learning-compatibility-target.enum.js";
import { RecommendationStatus } from "../../enums/recommendation-status.enum.js";
import { createLearningCompatibilityResult, } from "../entities/learning-compatibility-result.entity.js";
import { createLearningCompatibilityResultId } from "../../value-objects/learning-feedback-ids.vo.js";
const toStatus = (input) => {
    if (input.recommendation.status === RecommendationStatus.BLOCKED) {
        return LearningCompatibilityStatus.INCOMPATIBLE;
    }
    if (input.recommendation.status === RecommendationStatus.DRAFT) {
        return LearningCompatibilityStatus.COMPATIBLE_WITH_WARNINGS;
    }
    return LearningCompatibilityStatus.COMPATIBLE;
};
export class PublishableCandidateLearningAdapter {
    adapt(input) {
        const status = toStatus(input);
        return createLearningCompatibilityResult({
            id: createLearningCompatibilityResultId(`lcp_${input.improvement.id.slice(4)}pc`),
            correlation_id: input.recommendation.correlation_id,
            target: LearningCompatibilityTarget.PUBLISHABLE_CANDIDATE_LEARNING,
            status,
            mapped_artifact: {
                source_id: input.recommendation.id,
                target_id: input.improvement.id,
                readiness: status,
                lossy_fields: ["editorial_annotations", "runtime_counters"],
            },
            notes: ["loss-aware mapping to publishable candidate learning payload"],
        });
    }
}
//# sourceMappingURL=publishable-candidate-learning.adapter.js.map