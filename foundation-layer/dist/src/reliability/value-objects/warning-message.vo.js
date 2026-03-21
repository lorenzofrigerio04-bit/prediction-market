import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createWarningMessage = (input) => {
    if (input.code.trim().length === 0 || input.message.trim().length === 0 || input.path.trim().length === 0) {
        throw new ValidationError("INVALID_WARNING_MESSAGE", "WarningMessage requires non-empty code, message and path");
    }
    return deepFreeze(input);
};
export const createWarningMessageCollection = (input) => deepFreeze(input.map((item) => createWarningMessage(item)));
//# sourceMappingURL=warning-message.vo.js.map