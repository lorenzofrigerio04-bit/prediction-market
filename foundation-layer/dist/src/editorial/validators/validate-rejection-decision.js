import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { REJECTION_DECISION_SCHEMA_ID } from "../schemas/rejection-decision.schema.js";
const validateRejectionInvariants = (input) => {
    const issues = [];
    if (input.rejection_reason_codes.length === 0) {
        issues.push(errorIssue("MISSING_REJECTION_REASON_CODE", "/rejection_reason_codes", "rejection_reason_codes must contain at least one reason code"));
    }
    return issues;
};
export const validateRejectionDecision = (input, options) => {
    const schemaValidator = requireSchemaValidator(REJECTION_DECISION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateRejectionInvariants(input);
    return buildValidationReport("RejectionDecision", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-rejection-decision.js.map