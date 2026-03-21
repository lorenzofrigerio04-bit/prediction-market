import { LearningCompatibilityStatus } from "../../enums/learning-compatibility-status.enum.js";
import { LearningCompatibilityTarget } from "../../enums/learning-compatibility-target.enum.js";
import { RecommendationStatus } from "../../enums/recommendation-status.enum.js";
import { ReleaseImpact } from "../../enums/release-impact.enum.js";
import { createLearningCompatibilityResult, } from "../entities/learning-compatibility-result.entity.js";
import { createLearningCompatibilityResultId } from "../../value-objects/learning-feedback-ids.vo.js";
const toStatus = (input) => {
    if (input.recommendation.status === RecommendationStatus.BLOCKED) {
        return LearningCompatibilityStatus.INCOMPATIBLE;
    }
    if (input.reliability_signal.release_impact === ReleaseImpact.HIGH ||
        input.reliability_signal.release_impact === ReleaseImpact.CRITICAL) {
        return LearningCompatibilityStatus.COMPATIBLE_WITH_WARNINGS;
    }
    return LearningCompatibilityStatus.COMPATIBLE;
};
export class ReleaseGateLearningAdapter {
    adapt(input) {
        const status = toStatus(input);
        return createLearningCompatibilityResult({
            id: createLearningCompatibilityResultId(`lcp_${input.recommendation.id.slice(4)}rg`),
            correlation_id: input.reliability_signal.correlation_id,
            target: LearningCompatibilityTarget.RELEASE_GATE_LEARNING,
            status,
            mapped_artifact: {
                source_id: input.reliability_signal.id,
                target_id: input.recommendation.id,
                readiness: status,
                lossy_fields: ["historical_confidence_curve"],
            },
            notes: ["conservative release-gate bridge"],
        });
    }
}
//# sourceMappingURL=release-gate-learning.adapter.js.map