import { ValidationError } from "../../common/errors/validation-error.js";
const SEQUENCE_TARGET_KEY_PATTERN = /^[a-z][a-z0-9_]{1,31}$/;
export const createSequenceTargetKey = (value) => {
    if (!SEQUENCE_TARGET_KEY_PATTERN.test(value)) {
        throw new ValidationError("INVALID_SEQUENCE_TARGET_KEY", "sequence target key is invalid", {
            value,
        });
    }
    return value;
};
//# sourceMappingURL=sequence-target-key.vo.js.map