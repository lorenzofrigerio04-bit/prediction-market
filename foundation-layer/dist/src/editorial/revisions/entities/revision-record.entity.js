import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { createChangedFieldCollection } from "../../value-objects/changed-field.vo.js";
export const createRevisionRecord = (input) => {
    if (!Number.isInteger(input.revision_number) || input.revision_number < 1) {
        throw new ValidationError("INVALID_REVISION_RECORD", "revision_number must be a positive integer");
    }
    if (input.target_entity_type.trim().length === 0 || input.target_entity_id.trim().length === 0) {
        throw new ValidationError("INVALID_REVISION_RECORD", "target entity reference is required");
    }
    if (input.revision_reason.trim().length === 0) {
        throw new ValidationError("INVALID_REVISION_RECORD", "revision_reason is required");
    }
    return deepFreeze({
        ...input,
        changed_fields: createChangedFieldCollection(input.changed_fields),
    });
};
//# sourceMappingURL=revision-record.entity.js.map