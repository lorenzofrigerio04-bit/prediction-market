import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createOverrideScope = (input) => {
    if (input.affected_fields.length === 0 ||
        input.affected_fields.some((field) => field.trim().length === 0)) {
        throw new ValidationError("INVALID_OVERRIDE_SCOPE", "override scope must include at least one non-empty affected field");
    }
    return deepFreeze({
        ...input,
        affected_fields: deepFreeze([...input.affected_fields]),
    });
};
//# sourceMappingURL=override-scope.vo.js.map