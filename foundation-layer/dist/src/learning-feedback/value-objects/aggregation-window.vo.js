import { ValidationError } from "../../common/errors/validation-error.js";
export const createAggregationWindow = (value) => {
    if (!Number.isInteger(value) || value <= 0) {
        throw new ValidationError("INVALID_AGGREGATION_WINDOW", "aggregation_window must be an integer > 0", { value });
    }
    return value;
};
//# sourceMappingURL=aggregation-window.vo.js.map