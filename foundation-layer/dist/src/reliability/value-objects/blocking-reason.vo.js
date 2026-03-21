import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createBlockingReason = (input) => {
    if (input.code.trim().length === 0 || input.message.trim().length === 0 || input.path.trim().length === 0) {
        throw new ValidationError("INVALID_BLOCKING_REASON", "BlockingReason requires non-empty code, message and path");
    }
    return deepFreeze(input);
};
export const createBlockingReasonCollection = (input) => deepFreeze(input.map((item) => createBlockingReason(item)));
//# sourceMappingURL=blocking-reason.vo.js.map