import { ValidationError } from "../../common/errors/validation-error.js";
export const createScore01 = (value, field) => {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
        throw new ValidationError("INVALID_SCORE_RANGE", `${field} must be within [0,1]`, {
            field,
            value,
        });
    }
    return value;
};
export const createScore0100 = (value, field) => {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
        throw new ValidationError("INVALID_SCORE_RANGE", `${field} must be within [0,100]`, {
            field,
            value,
        });
    }
    return value;
};
//# sourceMappingURL=score.vo.js.map