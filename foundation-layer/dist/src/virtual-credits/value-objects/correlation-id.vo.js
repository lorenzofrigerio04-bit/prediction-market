import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";
export const createCorrelationId = (value) => {
    const normalized = createNonEmpty(value, "correlationId");
    if (normalized.length > 512) {
        throw new ValidationError("CORRELATION_ID_EMPTY", "CorrelationId exceeds max length", { length: normalized.length });
    }
    return normalized;
};
//# sourceMappingURL=correlation-id.vo.js.map