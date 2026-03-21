import { VALIDATION_REPORT_SCHEMA_ID } from "../schemas/entities/validation-report.schema.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "./common/validation-result.js";
export const validateValidationReport = (input, options) => {
    const schemaValidator = requireSchemaValidator(VALIDATION_REPORT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    return buildValidationReport("ValidationReport", input.targetId, schemaIssues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validation-report.validator.js.map