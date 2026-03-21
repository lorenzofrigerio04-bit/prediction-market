import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createLearningRef = (value, fieldName) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
        throw new ValidationError("INVALID_LEARNING_REFERENCE", `${fieldName} must not be empty`);
    }
    return normalized;
};
export const createLearningText = (value, fieldName) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
        throw new ValidationError("INVALID_LEARNING_TEXT", `${fieldName} must not be empty`);
    }
    return normalized;
};
export const createLearningRefList = (values, fieldName, minimum = 0) => {
    const normalized = values.map((value) => createLearningRef(value, fieldName));
    if (normalized.length < minimum) {
        throw new ValidationError("INVALID_LEARNING_REFERENCE_LIST", `${fieldName} must contain at least ${minimum} item(s)`);
    }
    if (new Set(normalized).size !== normalized.length) {
        throw new ValidationError("DUPLICATE_LEARNING_REFERENCE", `${fieldName} must be unique`);
    }
    return deepFreeze([...normalized]);
};
export const createLearningTextList = (values, fieldName, minimum = 0) => {
    const normalized = values.map((value) => createLearningText(value, fieldName));
    if (normalized.length < minimum) {
        throw new ValidationError("INVALID_LEARNING_TEXT_LIST", `${fieldName} must contain at least ${minimum} item(s)`);
    }
    return deepFreeze([...normalized]);
};
//# sourceMappingURL=learning-feedback-shared.vo.js.map