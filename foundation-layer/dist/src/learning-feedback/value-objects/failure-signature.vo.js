import { ValidationError } from "../../common/errors/validation-error.js";
export const createFailureSignature = (value) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
        throw new ValidationError("INVALID_FAILURE_SIGNATURE", "failure_signature must not be empty", { value });
    }
    return normalized;
};
//# sourceMappingURL=failure-signature.vo.js.map