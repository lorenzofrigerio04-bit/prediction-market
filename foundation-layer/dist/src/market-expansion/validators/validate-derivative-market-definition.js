import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { DERIVATIVE_MARKET_DEFINITION_SCHEMA_ID } from "../schemas/derivative-market-definition.schema.js";
const validateInvariants = (input) => {
    if (input.source_relation_ref.startsWith("invalid_")) {
        return [
            errorIssue("DERIVATIVE_INVALID_SOURCE_RELATION", "/source_relation_ref", "derivative cannot be promoted with invalid source relation"),
        ];
    }
    return [];
};
export const validateDerivativeMarketDefinition = (input, options) => {
    const schemaValidator = requireSchemaValidator(DERIVATIVE_MARKET_DEFINITION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInvariants(input);
    return buildValidationReport("DerivativeMarketDefinition", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-derivative-market-definition.js.map