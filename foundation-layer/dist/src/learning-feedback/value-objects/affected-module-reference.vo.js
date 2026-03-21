import { ValidationError } from "../../common/errors/validation-error.js";
export const createAffectedModuleReference = (value) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
        throw new ValidationError("INVALID_AFFECTED_MODULE_REFERENCE", "affected_module_reference must not be empty", { value });
    }
    return normalized;
};
//# sourceMappingURL=affected-module-reference.vo.js.map