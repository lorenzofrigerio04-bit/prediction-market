import { LearningCompatibilityStatus } from "../../enums/learning-compatibility-status.enum.js";
import { LearningCompatibilityTarget } from "../../enums/learning-compatibility-target.enum.js";
import { ReleaseImpact } from "../../enums/release-impact.enum.js";
import { createLearningCompatibilityResult, } from "../entities/learning-compatibility-result.entity.js";
import { createLearningCompatibilityResultId } from "../../value-objects/learning-feedback-ids.vo.js";
const toStatus = (input) => {
    if (input.reliability_signal.release_impact === ReleaseImpact.CRITICAL &&
        input.reliability_signal.active_pattern) {
        return LearningCompatibilityStatus.COMPATIBLE_WITH_WARNINGS;
    }
    return LearningCompatibilityStatus.COMPATIBLE;
};
export class ReliabilityReportLearningAdapter {
    adapt(input) {
        const status = toStatus(input);
        return createLearningCompatibilityResult({
            id: createLearningCompatibilityResultId(`lcp_${input.reliability_signal.id.slice(4)}rr`),
            correlation_id: input.reliability_signal.correlation_id,
            target: LearningCompatibilityTarget.RELIABILITY_REPORT_LEARNING,
            status,
            mapped_artifact: {
                source_id: input.reliability_signal.id,
                target_id: input.insight.id,
                readiness: status,
                lossy_fields: ["raw_regression_series"],
            },
            notes: ["deterministic reliability report mapping"],
        });
    }
}
//# sourceMappingURL=reliability-report-learning.adapter.js.map