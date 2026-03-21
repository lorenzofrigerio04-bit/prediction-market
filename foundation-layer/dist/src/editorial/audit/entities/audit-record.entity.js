import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ActionType } from "../../enums/action-type.enum.js";
export const createAuditRecord = (input) => {
    if (!Object.values(ActionType).includes(input.action_type)) {
        throw new ValidationError("INVALID_AUDIT_RECORD", "action_type is invalid");
    }
    if (input.target_type.trim().length === 0 || input.target_id.trim().length === 0) {
        throw new ValidationError("INVALID_AUDIT_RECORD", "target_type and target_id are required");
    }
    if (input.action_payload_summary.trim().length < 8) {
        throw new ValidationError("INVALID_AUDIT_RECORD", "action_payload_summary must be readable and at least 8 characters");
    }
    if (input.reason_codes.length === 0) {
        throw new ValidationError("INVALID_AUDIT_RECORD", "reason_codes must contain at least one item");
    }
    return deepFreeze({
        ...input,
        reason_codes: deepFreeze([...input.reason_codes]),
    });
};
//# sourceMappingURL=audit-record.entity.js.map