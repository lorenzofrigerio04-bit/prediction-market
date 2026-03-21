import { ValidationError } from "../../common/errors/validation-error.js";
export const createSummaryCount = (value) => {
    if (!Number.isInteger(value) || value < 0) {
        throw new ValidationError("INVALID_SUMMARY_COUNT", "summary_count must be a non-negative integer");
    }
    return value;
};
//# sourceMappingURL=summary-count.vo.js.map