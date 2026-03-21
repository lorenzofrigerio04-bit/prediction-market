import { ValidationError } from "../../common/errors/validation-error.js";
export const createPassRate = (value) => {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
        throw new ValidationError("INVALID_PASS_RATE", "PassRate must be between 0 and 1");
    }
    return value;
};
//# sourceMappingURL=pass-rate.vo.js.map