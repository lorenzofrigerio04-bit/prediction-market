import { CANDIDATE_MARKET_SCHEMA_ID } from "../schemas/entities/candidate-market.schema.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "./common/validation-result.js";
import { validateCandidateMarketInvariants } from "./domain-invariants.validator.js";
export const validateCandidateMarket = (input, options) => {
    const schemaValidator = requireSchemaValidator(CANDIDATE_MARKET_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateCandidateMarketInvariants(input)];
    return buildValidationReport("CandidateMarket", input.id, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=candidate-market.validator.js.map