import { errorIssue, } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { ENTITY_NORMALIZATION_RESULT_SCHEMA_ID } from "../schemas/entity-normalization-result.schema.js";
const validateEntityNormalizationResultInvariants = (input) => {
    const issues = [];
    if (input.normalized_entities.length === 0 && input.unresolved_entities.length === 0) {
        issues.push(errorIssue("EMPTY_NORMALIZATION_RESULT", "/normalized_entities", "at least one entity must be present in normalized_entities or unresolved_entities"));
    }
    return issues;
};
export const validateEntityNormalizationResult = (input, options) => {
    const schemaValidator = requireSchemaValidator(ENTITY_NORMALIZATION_RESULT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateEntityNormalizationResultInvariants(input)];
    return buildValidationReport("EntityNormalizationResult", "entity-normalization-result", issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-entity-normalization-result.js.map