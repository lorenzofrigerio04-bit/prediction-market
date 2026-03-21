import { ValidationError } from "../../common/errors/validation-error.js";
export const createFeedbackVersion = (value) => {
    if (!Number.isInteger(value) || value < 1) {
        throw new ValidationError("INVALID_FEEDBACK_VERSION", "feedback version must be an integer >= 1", { value });
    }
    return value;
};
//# sourceMappingURL=feedback-version.vo.js.map