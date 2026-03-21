import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";
export const createGrantReason = (value) => {
    const normalized = createNonEmpty(value, "grantReason");
    if (normalized.length > 512) {
        throw new ValidationError("GRANT_REASON_EMPTY", "GrantReason exceeds max length", { length: normalized.length });
    }
    return normalized;
};
//# sourceMappingURL=grant-reason.vo.js.map