import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createChangedFieldReference = (input) => {
    if (input.field_path.trim().length === 0 ||
        input.previous_value_summary.trim().length === 0 ||
        input.new_value_summary.trim().length === 0) {
        throw new ValidationError("INVALID_CHANGED_FIELD", "changed field references must be non-empty");
    }
    return deepFreeze(input);
};
export const createChangedFieldCollection = (input) => {
    if (input.length === 0) {
        throw new ValidationError("INVALID_CHANGED_FIELDS", "changed_fields must not be empty");
    }
    return deepFreeze(input.map((item) => createChangedFieldReference(item)));
};
//# sourceMappingURL=changed-field.vo.js.map