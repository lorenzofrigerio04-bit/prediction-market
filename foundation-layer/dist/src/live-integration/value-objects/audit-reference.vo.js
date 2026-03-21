import { createPrefixedId } from "../../common/utils/id.js";
import { ValidationError } from "../../common/errors/validation-error.js";
export const createAuditReference = (value) => createPrefixedId(value, "aref_", "LiveIntegrationAuditReference");
export const assertAuditReferencePresent = (value) => {
    if (value.trim().length === 0) {
        throw new ValidationError("MISSING_AUDIT_REFERENCE", "audit_ref is required");
    }
    return createAuditReference(value);
};
//# sourceMappingURL=audit-reference.vo.js.map