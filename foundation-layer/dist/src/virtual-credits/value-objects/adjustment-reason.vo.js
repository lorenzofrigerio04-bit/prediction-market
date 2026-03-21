import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";
export const createAdjustmentReason = (value) => {
    const normalized = createNonEmpty(value, "adjustmentReason");
    if (normalized.length > 512) {
        throw new ValidationError("ADJUSTMENT_REASON_EMPTY", "AdjustmentReason exceeds max length", { length: normalized.length });
    }
    return normalized;
};
//# sourceMappingURL=adjustment-reason.vo.js.map