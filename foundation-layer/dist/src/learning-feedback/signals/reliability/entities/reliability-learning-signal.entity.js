import { ValidationError } from "../../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../../common/utils/deep-freeze.js";
import { PatternStatus } from "../../../enums/pattern-status.enum.js";
import { ReleaseImpact } from "../../../enums/release-impact.enum.js";
import { createLearningRefList } from "../../../value-objects/learning-feedback-shared.vo.js";
export const createReliabilityLearningSignal = (input) => {
    if (!Object.values(ReleaseImpact).includes(input.release_impact)) {
        throw new ValidationError("INVALID_RELIABILITY_LEARNING_SIGNAL", "release_impact is invalid");
    }
    if (!Object.values(PatternStatus).includes(input.pattern_status)) {
        throw new ValidationError("INVALID_RELIABILITY_LEARNING_SIGNAL", "pattern_status is invalid");
    }
    if (!Number.isInteger(input.occurrence_count) || input.occurrence_count < 0) {
        throw new ValidationError("INVALID_RELIABILITY_LEARNING_SIGNAL", "occurrence_count must be an integer greater than or equal to 0");
    }
    if (input.correlation_id.trim().length === 0) {
        throw new ValidationError("INVALID_RELIABILITY_LEARNING_SIGNAL", "correlation_id is required");
    }
    const evidence_refs = createLearningRefList(input.evidence_refs, "evidence_refs");
    if (input.active_pattern) {
        if (input.occurrence_count <= 0) {
            throw new ValidationError("INVALID_RELIABILITY_LEARNING_SIGNAL", "active_pattern requires occurrence_count > 0");
        }
        if (input.pattern_status !== PatternStatus.ACTIVE) {
            throw new ValidationError("INVALID_RELIABILITY_LEARNING_SIGNAL", "active_pattern requires pattern_status=active");
        }
        if (evidence_refs.length === 0) {
            throw new ValidationError("INVALID_RELIABILITY_LEARNING_SIGNAL", "active_pattern requires non-empty evidence_refs");
        }
    }
    if ((input.release_impact === ReleaseImpact.HIGH || input.release_impact === ReleaseImpact.CRITICAL) &&
        (input.safe_to_ignore || input.ignored_ready)) {
        throw new ValidationError("INVALID_RELIABILITY_LEARNING_SIGNAL", "high/critical release_impact cannot be safe_to_ignore or ignored_ready");
    }
    return deepFreeze({
        ...input,
        evidence_refs,
    });
};
//# sourceMappingURL=reliability-learning-signal.entity.js.map