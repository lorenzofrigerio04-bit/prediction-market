import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { EDITORIAL_REVIEW_SCHEMA_ID } from "../schemas/editorial-review.schema.js";
import { createSeveritySummary } from "../value-objects/severity-summary.vo.js";
const validateEditorialReviewInvariants = (input) => {
    const issues = [];
    const summary = createSeveritySummary({
        low: input.findings.filter((item) => item.severity === "low").length,
        medium: input.findings.filter((item) => item.severity === "medium").length,
        high: input.findings.filter((item) => item.severity === "high").length,
        critical: input.findings.filter((item) => item.severity === "critical").length,
    });
    if (summary.total_findings !== input.severity_summary.total_findings) {
        issues.push(errorIssue("SEVERITY_SUMMARY_MISMATCH", "/severity_summary/total_findings", "severity_summary.total_findings must match findings"));
    }
    if (summary.highest_severity !== input.severity_summary.highest_severity) {
        issues.push(errorIssue("SEVERITY_SUMMARY_MISMATCH", "/severity_summary/highest_severity", "severity_summary.highest_severity must match findings severities"));
    }
    return issues;
};
export const validateEditorialReview = (input, options) => {
    const schemaValidator = requireSchemaValidator(EDITORIAL_REVIEW_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateEditorialReviewInvariants(input);
    return buildValidationReport("EditorialReview", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-editorial-review.js.map