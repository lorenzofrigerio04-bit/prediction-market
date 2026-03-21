import { ValidationError } from "../common/errors/validation-error.js";
export const createEntityVersion = (value = 1) => {
    if (!Number.isInteger(value) || value <= 0) {
        throw new ValidationError("INVALID_ENTITY_VERSION", "EntityVersion must be a positive integer", { value });
    }
    return value;
};
//# sourceMappingURL=entity-version.vo.js.map