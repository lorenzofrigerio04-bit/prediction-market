import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";
export const createActionKey = (value) => {
    const normalized = createNonEmpty(value, "actionKey");
    if (normalized.length > 512) {
        throw new ValidationError("ACTION_KEY_EMPTY", "ActionKey exceeds max length", { length: normalized.length });
    }
    return normalized;
};
//# sourceMappingURL=action-key.vo.js.map