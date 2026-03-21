import { ValidationError } from "../../common/errors/validation-error.js";
export const createSafetyConstraint = (value) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
        throw new ValidationError("INVALID_SAFETY_CONSTRAINT", "safety_constraint must not be empty", { value });
    }
    return normalized;
};
//# sourceMappingURL=safety-constraint.vo.js.map