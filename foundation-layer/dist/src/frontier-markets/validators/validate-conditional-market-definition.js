import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { ConditionalValidationStatus } from "../enums/conditional-validation-status.enum.js";
import { CONDITIONAL_MARKET_DEFINITION_SCHEMA_ID } from "../schemas/conditional-market-definition.schema.js";
const validateConditionalInvariants = (input) => {
    const issues = [];
    if (input.trigger_condition.triggering_outcome.trim().length === 0) {
        issues.push(errorIssue("CONDITIONAL_TRIGGER_REQUIRED", "/trigger_condition", "conditional market must have explicit trigger condition"));
    }
    if (input.conditional_validation_status === ConditionalValidationStatus.ACTIVE_READY &&
        input.trigger_condition.triggering_outcome.trim().length === 0) {
        issues.push(errorIssue("CONDITIONAL_ACTIVE_READY_INVALID", "/conditional_validation_status", "conditional market cannot be active-ready when trigger is undefined"));
    }
    return issues;
};
export const validateConditionalMarketDefinition = (input, options) => {
    const schemaValidator = requireSchemaValidator(CONDITIONAL_MARKET_DEFINITION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateConditionalInvariants(input);
    return buildValidationReport("ConditionalMarketDefinition", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-conditional-market-definition.js.map