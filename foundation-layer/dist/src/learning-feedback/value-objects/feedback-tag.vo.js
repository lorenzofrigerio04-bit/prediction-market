import { ValidationError } from "../../common/errors/validation-error.js";
export const createFeedbackTag = (value) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
        throw new ValidationError("INVALID_FEEDBACK_TAG", "feedback_tag must not be empty", { value });
    }
    return normalized;
};
//# sourceMappingURL=feedback-tag.vo.js.map