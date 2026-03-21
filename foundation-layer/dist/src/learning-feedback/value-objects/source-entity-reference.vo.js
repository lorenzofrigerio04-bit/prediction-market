import { ValidationError } from "../../common/errors/validation-error.js";
export const createSourceEntityReference = (value) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
        throw new ValidationError("INVALID_SOURCE_ENTITY_REFERENCE", "source_entity_reference must not be empty", { value });
    }
    return normalized;
};
//# sourceMappingURL=source-entity-reference.vo.js.map