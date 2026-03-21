import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { MARKET_FAMILY_SCHEMA_ID } from "../schemas/market-family.schema.js";
const validateInvariants = (input) => {
    const issues = [];
    if (input.flagship_market_ref.trim().length === 0) {
        issues.push(errorIssue("FAMILY_FLAGSHIP_REQUIRED", "/flagship_market_ref", "flagship_market_ref is required"));
    }
    if (new Set(input.satellite_market_refs).size !== input.satellite_market_refs.length) {
        issues.push(errorIssue("FAMILY_SATELLITE_DUPLICATE_REFS", "/satellite_market_refs", "satellite_market_refs must be unique"));
    }
    if (new Set(input.derivative_market_refs).size !== input.derivative_market_refs.length) {
        issues.push(errorIssue("FAMILY_DERIVATIVE_DUPLICATE_REFS", "/derivative_market_refs", "derivative_market_refs must be unique"));
    }
    const allRefs = [
        input.flagship_market_ref,
        ...input.satellite_market_refs,
        ...input.derivative_market_refs,
    ];
    if (new Set(allRefs).size !== allRefs.length) {
        issues.push(errorIssue("FAMILY_MARKET_REFS_NON_UNIQUE", "/", "all market refs must be unique in family"));
    }
    return issues;
};
export const validateMarketFamily = (input, options) => {
    const schemaValidator = requireSchemaValidator(MARKET_FAMILY_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInvariants(input);
    return buildValidationReport("MarketFamily", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-market-family.js.map