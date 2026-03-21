import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { SEQUENCE_TARGET_SCHEMA_ID } from "../schemas/sequence-target.schema.js";
export const validateSequenceTarget = (input, options) => {
    const schemaValidator = requireSchemaValidator(SEQUENCE_TARGET_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    return buildValidationReport("SequenceTarget", input.target_key, schemaIssues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-sequence-target.js.map