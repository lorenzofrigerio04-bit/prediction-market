import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ReviewStatus } from "../../enums/review-status.enum.js";
import { createRequiredActionCollection } from "../../value-objects/required-action.vo.js";
import { createSeveritySummary } from "../../value-objects/severity-summary.vo.js";
const normalizeSeveritySummary = (findings) => {
    const low = findings.filter((item) => item.severity === "low").length;
    const medium = findings.filter((item) => item.severity === "medium").length;
    const high = findings.filter((item) => item.severity === "high").length;
    const critical = findings.filter((item) => item.severity === "critical").length;
    return createSeveritySummary({ low, medium, high, critical });
};
export const createEditorialReview = (input) => {
    if (!Object.values(ReviewStatus).includes(input.review_status)) {
        throw new ValidationError("INVALID_EDITORIAL_REVIEW", "review_status is invalid");
    }
    if (input.findings.some((item) => item.message.trim().length === 0 || item.path.trim().length === 0)) {
        throw new ValidationError("INVALID_EDITORIAL_REVIEW", "findings require non-empty message and path");
    }
    const recomputedSummary = normalizeSeveritySummary(input.findings);
    if (recomputedSummary.total_findings !== input.severity_summary.total_findings ||
        recomputedSummary.highest_severity !== input.severity_summary.highest_severity ||
        recomputedSummary.low !== input.severity_summary.low ||
        recomputedSummary.medium !== input.severity_summary.medium ||
        recomputedSummary.high !== input.severity_summary.high ||
        recomputedSummary.critical !== input.severity_summary.critical) {
        throw new ValidationError("INCONSISTENT_SEVERITY_SUMMARY", "severity_summary must match findings severities");
    }
    return deepFreeze({
        ...input,
        findings: deepFreeze([...input.findings]),
        required_actions: createRequiredActionCollection(input.required_actions),
    });
};
//# sourceMappingURL=editorial-review.entity.js.map