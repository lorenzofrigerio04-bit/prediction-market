import { ValidationError } from "../../common/errors/validation-error.js";
export const createDeadlineBasisReference = (value) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
        throw new ValidationError("INVALID_DEADLINE_BASIS_REFERENCE", "deadline_basis_reference must be non-empty");
    }
    return normalized;
};
//# sourceMappingURL=deadline-basis-reference.vo.js.map