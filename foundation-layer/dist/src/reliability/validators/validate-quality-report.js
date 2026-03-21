import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { QUALITY_REPORT_SCHEMA_ID } from "../schemas/quality-report.schema.js";
const validateQualityReportInvariants = (input) => {
    const issues = [];
    if (input.summary.trim().length === 0) {
        issues.push(errorIssue("EMPTY_REPORT_SUMMARY", "/summary", "QualityReport.summary must not be empty"));
    }
    return issues;
};
export const validateQualityReport = (input, options) => {
    const schemaValidator = requireSchemaValidator(QUALITY_REPORT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateQualityReportInvariants(input);
    return buildValidationReport("QualityReport", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-quality-report.js.map