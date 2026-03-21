import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";
export const createAuditRef = (value) => {
    const normalized = createNonEmpty(value, "auditRef");
    if (normalized.length > 512) {
        throw new ValidationError("AUDIT_REF_EMPTY", "AuditRef exceeds max length", { length: normalized.length });
    }
    return normalized;
};
//# sourceMappingURL=audit-ref.vo.js.map