import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
export const createRejectionDecision = (input) => {
    if (input.rejection_reason_codes.length === 0) {
        throw new ValidationError("INVALID_REJECTION_DECISION", "rejection_reason_codes must contain at least one reason code");
    }
    return deepFreeze({
        ...input,
        rejection_reason_codes: deepFreeze([...input.rejection_reason_codes]),
    });
};
//# sourceMappingURL=rejection-decision.entity.js.map