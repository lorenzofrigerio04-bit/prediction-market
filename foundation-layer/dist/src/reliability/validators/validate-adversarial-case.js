import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { ADVERSARIAL_CASE_SCHEMA_ID } from "../schemas/adversarial-case.schema.js";
const validateAdversarialCaseInvariants = (input) => {
    const issues = [];
    if (input.active && input.expected_rejection_or_behavior.trim().length === 0) {
        issues.push(errorIssue("ACTIVE_ADVERSARIAL_EXPECTED_BEHAVIOR_REQUIRED", "/expected_rejection_or_behavior", "AdversarialCase.expectedRejectionOrBehavior is required when active is true"));
    }
    return issues;
};
export const validateAdversarialCase = (input, options) => {
    const schemaValidator = requireSchemaValidator(ADVERSARIAL_CASE_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateAdversarialCaseInvariants(input);
    return buildValidationReport("AdversarialCase", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-adversarial-case.js.map