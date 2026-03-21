import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { OverrideType } from "../../enums/override-type.enum.js";
import { createOverrideScope } from "../../value-objects/override-scope.vo.js";
export const createManualOverride = (input) => {
    if (!Object.values(OverrideType).includes(input.override_type)) {
        throw new ValidationError("INVALID_MANUAL_OVERRIDE", "override_type is invalid");
    }
    if (input.override_reason.trim().length === 0) {
        throw new ValidationError("INVALID_MANUAL_OVERRIDE", "override_reason is required");
    }
    if (input.target_entity_type.trim().length === 0 || input.target_entity_id.trim().length === 0) {
        throw new ValidationError("INVALID_MANUAL_OVERRIDE", "target entity reference is required");
    }
    if (input.expiration_nullable !== null && Date.parse(input.expiration_nullable) <= Date.parse(input.initiated_at)) {
        throw new ValidationError("INVALID_MANUAL_OVERRIDE", "expiration_nullable must be greater than initiated_at when present");
    }
    return deepFreeze({
        ...input,
        override_scope: createOverrideScope(input.override_scope),
    });
};
//# sourceMappingURL=manual-override.entity.js.map