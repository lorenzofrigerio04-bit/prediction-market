import { ValidationError } from "../../common/errors/validation-error.js";
import { createPrefixedId } from "../../common/utils/id.js";
export const createAuditReferenceId = (value) => createPrefixedId(value, "aref_", "AuditReferenceId");
export const createAuditCorrelationId = (value) => createPrefixedId(value, "corr_", "AuditCorrelationId");
export const assertAuditReferencePresent = (value) => {
    if (value.trim().length === 0) {
        throw new ValidationError("MISSING_AUDIT_REFERENCE", "audit reference is required");
    }
    return createAuditReferenceId(value);
};
//# sourceMappingURL=audit-reference.vo.js.map