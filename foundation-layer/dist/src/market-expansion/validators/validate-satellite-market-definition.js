import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { SATELLITE_MARKET_DEFINITION_SCHEMA_ID } from "../schemas/satellite-market-definition.schema.js";
const validateInvariants = (input) => {
    if (input.parent_market_ref === input.market_ref) {
        return [
            errorIssue("SATELLITE_EQUALS_FLAGSHIP", "/market_ref", "satellite market_ref cannot be equal to parent_market_ref"),
        ];
    }
    return [];
};
export const validateSatelliteMarketDefinition = (input, options) => {
    const schemaValidator = requireSchemaValidator(SATELLITE_MARKET_DEFINITION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInvariants(input);
    return buildValidationReport("SatelliteMarketDefinition", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-satellite-market-definition.js.map