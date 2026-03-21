import { ValidationError } from "../../common/errors/validation-error.js";
export const createActionItem = (value) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
        throw new ValidationError("INVALID_ACTION_ITEM", "action_item must not be empty", { value });
    }
    return normalized;
};
//# sourceMappingURL=action-item.vo.js.map