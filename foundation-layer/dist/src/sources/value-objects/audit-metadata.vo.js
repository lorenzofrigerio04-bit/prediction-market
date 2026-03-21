import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createAuditMetadata = (input) => {
    const createdBy = input.createdBy.trim();
    const updatedBy = input.updatedBy.trim();
    if (createdBy.length === 0 || updatedBy.length === 0) {
        throw new ValidationError("INVALID_AUDIT_METADATA", "createdBy and updatedBy must be non-empty", { createdBy: input.createdBy, updatedBy: input.updatedBy });
    }
    return deepFreeze({
        createdBy,
        createdAt: input.createdAt,
        updatedBy,
        updatedAt: input.updatedAt,
    });
};
//# sourceMappingURL=audit-metadata.vo.js.map