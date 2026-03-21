import { ValidationError } from "../../common/errors/validation-error.js";
export const createWarningMessage = (value) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
        throw new ValidationError("INVALID_WARNING_MESSAGE", "warning_message must not be empty", { value });
    }
    return normalized;
};
//# sourceMappingURL=warning-message.vo.js.map