import { ValidationError } from "../../common/errors/validation-error.js";
export const createDependencyReference = (value) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
        throw new ValidationError("INVALID_DEPENDENCY_REFERENCE", "dependency_reference must not be empty", { value });
    }
    return normalized;
};
//# sourceMappingURL=dependency-reference.vo.js.map