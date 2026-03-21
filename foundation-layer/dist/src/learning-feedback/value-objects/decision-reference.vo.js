import { ValidationError } from "../../common/errors/validation-error.js";
export const createDecisionReference = (value) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
        throw new ValidationError("INVALID_DECISION_REFERENCE", "decision_reference must not be empty", { value });
    }
    return normalized;
};
//# sourceMappingURL=decision-reference.vo.js.map