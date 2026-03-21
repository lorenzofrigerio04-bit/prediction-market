import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createWarningEntry = (input) => {
    if (input.message.trim().length === 0 || input.path.trim().length === 0) {
        throw new ValidationError("INVALID_WARNING", "warning requires non-empty message and path");
    }
    return deepFreeze(input);
};
export const createWarningCollection = (input) => {
    const normalized = input.map((item) => createWarningEntry(item));
    return deepFreeze([...normalized]);
};
//# sourceMappingURL=warning.vo.js.map