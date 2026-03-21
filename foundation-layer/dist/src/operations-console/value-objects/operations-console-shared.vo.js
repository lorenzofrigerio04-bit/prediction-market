import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createNonEmptyConsoleText = (value, code, field) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
        throw new ValidationError(code, `${field} must not be empty`);
    }
    return normalized;
};
export const createUniqueConsoleList = (values, code, field) => {
    const normalized = values.map((value) => createNonEmptyConsoleText(value, code, field));
    if (new Set(normalized).size !== normalized.length) {
        throw new ValidationError(code, `${field} must be unique`);
    }
    return deepFreeze([...normalized]);
};
//# sourceMappingURL=operations-console-shared.vo.js.map