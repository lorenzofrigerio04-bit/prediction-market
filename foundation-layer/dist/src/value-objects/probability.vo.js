import { ValidationError } from "../common/errors/validation-error.js";
export const createProbability = (value) => {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
        throw new ValidationError("INVALID_PROBABILITY", "Probability must be within [0,1]", {
            value,
        });
    }
    return value;
};
//# sourceMappingURL=probability.vo.js.map