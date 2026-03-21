import { ValidationError } from "../../common/errors/validation-error.js";
const OUTCOME_KEY_PATTERN = /^[a-z0-9][a-z0-9_:-]{1,62}$/;
export const createOutcomeKey = (value) => {
    if (!OUTCOME_KEY_PATTERN.test(value)) {
        throw new ValidationError("INVALID_OUTCOME_KEY", "outcome_key must match /^[a-z0-9][a-z0-9_:-]{1,62}$/", { value });
    }
    return value;
};
//# sourceMappingURL=outcome-key.vo.js.map