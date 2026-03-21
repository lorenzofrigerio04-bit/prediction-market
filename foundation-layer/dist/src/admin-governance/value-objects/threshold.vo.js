import { ValidationError } from "../../common/errors/validation-error.js";
export const createThreshold = (value) => {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
        throw new ValidationError("INVALID_THRESHOLD", "threshold must be in [0,1]", { value });
    }
    return value;
};
//# sourceMappingURL=threshold.vo.js.map