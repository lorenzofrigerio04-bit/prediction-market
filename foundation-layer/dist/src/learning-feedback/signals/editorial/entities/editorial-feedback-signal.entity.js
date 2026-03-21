import { ValidationError } from "../../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../../common/utils/deep-freeze.js";
import { FeedbackReasonCode } from "../../../enums/feedback-reason-code.enum.js";
import { FeedbackType } from "../../../enums/feedback-type.enum.js";
import { createLearningRefList, createLearningTextList, } from "../../../value-objects/learning-feedback-shared.vo.js";
const validateEditorialCoherence = (feedbackType, decisionRefs, reasonCodes) => {
    if (feedbackType === FeedbackType.APPROVAL &&
        reasonCodes.some((reason) => reason === FeedbackReasonCode.BLOCKING_DEPENDENCY || reason === FeedbackReasonCode.SAFETY_RISK)) {
        throw new ValidationError("INVALID_EDITORIAL_FEEDBACK_SIGNAL", "approval feedback_type cannot contain blocking reason codes");
    }
    if (feedbackType === FeedbackType.REJECTION && reasonCodes.length === 0) {
        throw new ValidationError("INVALID_EDITORIAL_FEEDBACK_SIGNAL", "rejection feedback_type requires non-empty reason_codes");
    }
    if (feedbackType === FeedbackType.REVISION_REQUEST) {
        if (decisionRefs.length === 0) {
            throw new ValidationError("INVALID_EDITORIAL_FEEDBACK_SIGNAL", "revision_request feedback_type requires non-empty decision_refs");
        }
        if (reasonCodes.length === 0) {
            throw new ValidationError("INVALID_EDITORIAL_FEEDBACK_SIGNAL", "revision_request feedback_type requires non-empty reason_codes");
        }
    }
    if (feedbackType === FeedbackType.MANUAL_OVERRIDE && decisionRefs.length === 0) {
        throw new ValidationError("INVALID_EDITORIAL_FEEDBACK_SIGNAL", "manual_override feedback_type requires at least one decision_ref");
    }
};
export const createEditorialFeedbackSignal = (input) => {
    if (!Object.values(FeedbackType).includes(input.feedback_type)) {
        throw new ValidationError("INVALID_EDITORIAL_FEEDBACK_SIGNAL", "feedback_type is invalid");
    }
    if (input.correlation_id.trim().length === 0) {
        throw new ValidationError("INVALID_EDITORIAL_FEEDBACK_SIGNAL", "correlation_id is required");
    }
    const decision_refs = createLearningRefList(input.decision_refs, "decision_refs");
    const reason_codes = deepFreeze(input.reason_codes.map((code) => {
        if (!Object.values(FeedbackReasonCode).includes(code)) {
            throw new ValidationError("INVALID_EDITORIAL_FEEDBACK_SIGNAL", "reason_codes contains invalid value");
        }
        return code;
    }));
    validateEditorialCoherence(input.feedback_type, decision_refs, reason_codes);
    return deepFreeze({
        ...input,
        decision_refs,
        reason_codes,
        notes: createLearningTextList(input.notes, "notes"),
    });
};
//# sourceMappingURL=editorial-feedback-signal.entity.js.map