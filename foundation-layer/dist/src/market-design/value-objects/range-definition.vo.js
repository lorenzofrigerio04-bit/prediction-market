import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createRangeDefinition = (input) => {
    if (!Number.isFinite(input.min_inclusive) || !Number.isFinite(input.max_exclusive)) {
        throw new ValidationError("INVALID_RANGE_DEFINITION", "range bounds must be finite numbers");
    }
    if (input.max_exclusive <= input.min_inclusive) {
        throw new ValidationError("INVALID_RANGE_DEFINITION", "max_exclusive must be greater than min_inclusive", input);
    }
    return deepFreeze({
        ...input,
        label_nullable: input.label_nullable === null ? null : input.label_nullable.trim(),
    });
};
//# sourceMappingURL=range-definition.vo.js.map