import { FeedbackType } from "../../enums/feedback-type.enum.js";
import { LearningCompatibilityStatus } from "../../enums/learning-compatibility-status.enum.js";
import { LearningCompatibilityTarget } from "../../enums/learning-compatibility-target.enum.js";
import { LearningInsightStatus } from "../../enums/learning-insight-status.enum.js";
import { createLearningCompatibilityResult, } from "../entities/learning-compatibility-result.entity.js";
import { createLearningCompatibilityResultId } from "../../value-objects/learning-feedback-ids.vo.js";
const toStatus = (input) => {
    if (input.editorial_signal.feedback_type === FeedbackType.REJECTION) {
        return LearningCompatibilityStatus.COMPATIBLE_WITH_WARNINGS;
    }
    if (input.insight.insight_status === LearningInsightStatus.NEW) {
        return LearningCompatibilityStatus.COMPATIBLE_WITH_WARNINGS;
    }
    return LearningCompatibilityStatus.COMPATIBLE;
};
export class EditorialReviewLearningAdapter {
    adapt(input) {
        const status = toStatus(input);
        return createLearningCompatibilityResult({
            id: createLearningCompatibilityResultId(`lcp_${input.editorial_signal.id.slice(4)}er`),
            correlation_id: input.editorial_signal.correlation_id,
            target: LearningCompatibilityTarget.EDITORIAL_REVIEW_LEARNING,
            status,
            mapped_artifact: {
                source_id: input.editorial_signal.id,
                target_id: input.insight.id,
                readiness: status,
                lossy_fields: ["full_decision_audit_log"],
            },
            notes: ["deterministic editorial review mapping"],
        });
    }
}
//# sourceMappingURL=editorial-review-learning.adapter.js.map