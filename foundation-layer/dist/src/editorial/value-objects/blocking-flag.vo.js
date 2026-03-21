import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createBlockingFlag = (input) => {
    if (input.message.trim().length === 0 || input.path.trim().length === 0) {
        throw new ValidationError("INVALID_BLOCKING_FLAG", "blocking flag requires non-empty message and path");
    }
    return deepFreeze(input);
};
export const createBlockingFlagCollection = (input, fieldName) => {
    const normalized = input.map((item) => createBlockingFlag(item));
    const dedupe = new Set();
    for (const item of normalized) {
        const key = `${item.code}|${item.path}`;
        if (dedupe.has(key)) {
            throw new ValidationError("DUPLICATE_BLOCKING_FLAG", `${fieldName} contains duplicate code/path`, {
                key,
            });
        }
        dedupe.add(key);
    }
    return deepFreeze([...normalized]);
};
//# sourceMappingURL=blocking-flag.vo.js.map