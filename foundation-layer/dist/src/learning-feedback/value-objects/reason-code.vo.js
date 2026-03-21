import { ValidationError } from "../../common/errors/validation-error.js";
export const createReasonCode = (value) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
        throw new ValidationError("INVALID_REASON_CODE", "reason_code must not be empty", { value });
    }
    return normalized;
};
//# sourceMappingURL=reason-code.vo.js.map