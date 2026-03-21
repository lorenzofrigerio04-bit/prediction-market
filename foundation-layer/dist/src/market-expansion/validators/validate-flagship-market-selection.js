import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { FLAGSHIP_MARKET_SELECTION_SCHEMA_ID } from "../schemas/flagship-market-selection.schema.js";
export const validateFlagshipMarketSelection = (input, options) => {
    const schemaValidator = requireSchemaValidator(FLAGSHIP_MARKET_SELECTION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    return buildValidationReport("FlagshipMarketSelection", input.id, schemaIssues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-flagship-market-selection.js.map