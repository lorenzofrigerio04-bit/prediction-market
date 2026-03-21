import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { OpportunityStatus } from "../../enums/opportunity-status.enum.js";
import { OPPORTUNITY_ASSESSMENT_SCHEMA_ID } from "../../schemas/opportunity-assessment.schema.js";
const validateOpportunityAssessmentInvariants = (input) => {
    const issues = [];
    if (input.opportunity_status === OpportunityStatus.BLOCKED && input.blocking_reasons.length === 0) {
        issues.push(errorIssue("INVALID_BLOCKING_CONSISTENCY", "/blocking_reasons", "blocking_reasons must be non-empty when opportunity_status is blocked"));
    }
    if (input.opportunity_status === OpportunityStatus.ELIGIBLE && input.blocking_reasons.length > 0) {
        issues.push(errorIssue("INVALID_BLOCKING_CONSISTENCY", "/blocking_reasons", "blocking_reasons must be empty when opportunity_status is eligible"));
    }
    return issues;
};
export const validateOpportunityAssessment = (input, options) => {
    const schemaValidator = requireSchemaValidator(OPPORTUNITY_ASSESSMENT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateOpportunityAssessmentInvariants(input)];
    return buildValidationReport("OpportunityAssessment", input.id, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-opportunity-assessment.js.map