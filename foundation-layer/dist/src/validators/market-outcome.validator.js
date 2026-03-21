import { MARKET_OUTCOME_SCHEMA_ID } from "../schemas/entities/market-outcome.schema.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "./common/validation-result.js";
import { validateMarketOutcomeInvariants } from "./domain-invariants.validator.js";
export const validateMarketOutcome = (input, options) => {
    const schemaValidator = requireSchemaValidator(MARKET_OUTCOME_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateMarketOutcomeInvariants(input)];
    return buildValidationReport("MarketOutcome", input.id, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=market-outcome.validator.js.map