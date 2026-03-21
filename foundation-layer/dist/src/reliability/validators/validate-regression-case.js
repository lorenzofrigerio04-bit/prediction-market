import { errorIssue } from "../../entities/validation-report.entity.js";
import { SeverityLevel } from "../enums/severity-level.enum.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { REGRESSION_CASE_SCHEMA_ID } from "../schemas/regression-case.schema.js";
const validateRegressionCaseInvariants = (input) => {
    const issues = [];
    if (input.severity === SeverityLevel.CRITICAL && input.expected_behavior.trim().length === 0) {
        issues.push(errorIssue("CRITICAL_EXPECTED_BEHAVIOR_REQUIRED", "/expected_behavior", "RegressionCase.expectedBehavior is required for CRITICAL severity"));
    }
    return issues;
};
export const validateRegressionCase = (input, options) => {
    const schemaValidator = requireSchemaValidator(REGRESSION_CASE_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateRegressionCaseInvariants(input);
    return buildValidationReport("RegressionCase", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-regression-case.js.map