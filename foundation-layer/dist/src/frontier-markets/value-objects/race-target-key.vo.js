import { ValidationError } from "../../common/errors/validation-error.js";
const RACE_TARGET_KEY_PATTERN = /^[a-z][a-z0-9_]{1,31}$/;
export const createRaceTargetKey = (value) => {
    if (!RACE_TARGET_KEY_PATTERN.test(value)) {
        throw new ValidationError("INVALID_RACE_TARGET_KEY", "race target key is invalid", {
            value,
        });
    }
    return value;
};
//# sourceMappingURL=race-target-key.vo.js.map