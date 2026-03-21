import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createRequiredAction = (input) => {
    if (input.description.trim().length === 0 || input.owner.trim().length === 0) {
        throw new ValidationError("INVALID_REQUIRED_ACTION", "required action needs non-empty description and owner");
    }
    return deepFreeze(input);
};
export const createRequiredActionCollection = (input) => deepFreeze(input.map((item) => createRequiredAction(item)));
//# sourceMappingURL=required-action.vo.js.map