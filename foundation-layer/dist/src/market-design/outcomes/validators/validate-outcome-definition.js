import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { OUTCOME_DEFINITION_SCHEMA_ID } from "../../schemas/outcome-definition.schema.js";
export const validateOutcomeDefinition = (input, options) => {
    const schemaValidator = requireSchemaValidator(OUTCOME_DEFINITION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    return buildValidationReport("OutcomeDefinition", input.id, schemaIssues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-outcome-definition.js.map