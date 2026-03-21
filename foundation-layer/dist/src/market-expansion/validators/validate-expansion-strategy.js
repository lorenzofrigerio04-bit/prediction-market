import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { EXPANSION_STRATEGY_SCHEMA_ID } from "../schemas/expansion-strategy.schema.js";
const validateInvariants = (input) => {
    const issues = [];
    if (input.max_satellite_count < 0 || input.max_derivative_count < 0) {
        issues.push(errorIssue("STRATEGY_LIMITS_NEGATIVE", "/", "strategy limits must be non-negative"));
    }
    return issues;
};
export const validateExpansionStrategy = (input, options) => {
    const schemaValidator = requireSchemaValidator(EXPANSION_STRATEGY_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInvariants(input);
    return buildValidationReport("ExpansionStrategy", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-expansion-strategy.js.map