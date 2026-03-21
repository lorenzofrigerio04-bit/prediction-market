import { ValidationError } from "../../common/errors/validation-error.js";
import { assertNonEmpty } from "../../common/utils/normalization.js";
export const createNonEmpty = (value, field) => assertNonEmpty(value, field);
export const createPositiveFinite = (value, field) => {
    if (!Number.isFinite(value) || value <= 0) {
        throw new ValidationError("INVALID_NUMBER", `${field} must be a finite number > 0`, { field, value });
    }
    return value;
};
//# sourceMappingURL=shared.vo.js.map