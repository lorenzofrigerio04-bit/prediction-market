import { SOURCE_RECORD_SCHEMA_ID } from "../schemas/entities/source-record.schema.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "./common/validation-result.js";
import { validateSourceRecordInvariants } from "./domain-invariants.validator.js";
export const validateSourceRecord = (input, options) => {
    const schemaValidator = requireSchemaValidator(SOURCE_RECORD_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateSourceRecordInvariants(input)];
    return buildValidationReport("SourceRecord", input.id, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=source-record.validator.js.map