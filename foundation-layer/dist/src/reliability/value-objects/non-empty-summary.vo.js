import { ValidationError } from "../../common/errors/validation-error.js";
export const createNonEmptySummary = (value) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
        throw new ValidationError("INVALID_SUMMARY", "QualityReport.summary must not be empty");
    }
    return normalized;
};
//# sourceMappingURL=non-empty-summary.vo.js.map