import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const FINDING_SEVERITIES = ["low", "medium", "high", "critical"];
const highestFromSummary = (input) => {
    if (input.critical > 0) {
        return "critical";
    }
    if (input.high > 0) {
        return "high";
    }
    if (input.medium > 0) {
        return "medium";
    }
    return "low";
};
export const createSeveritySummary = (input) => {
    const values = [input.low, input.medium, input.high, input.critical];
    if (values.some((value) => !Number.isInteger(value) || value < 0)) {
        throw new ValidationError("INVALID_SEVERITY_SUMMARY", "severity counts must be non-negative integers");
    }
    const total = input.low + input.medium + input.high + input.critical;
    return deepFreeze({
        ...input,
        total_findings: total,
        highest_severity: highestFromSummary(input),
    });
};
//# sourceMappingURL=severity-summary.vo.js.map