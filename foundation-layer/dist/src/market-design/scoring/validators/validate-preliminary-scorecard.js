import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { PRELIMINARY_SCORECARD_SCHEMA_ID } from "../../schemas/preliminary-scorecard.schema.js";
export const validatePreliminaryScorecard = (input, options) => {
    const schemaValidator = requireSchemaValidator(PRELIMINARY_SCORECARD_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    return buildValidationReport("PreliminaryScorecard", "preliminary-scorecard", schemaIssues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-preliminary-scorecard.js.map