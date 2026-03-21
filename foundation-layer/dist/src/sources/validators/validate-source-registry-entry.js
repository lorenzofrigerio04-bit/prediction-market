import { errorIssue, } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { SOURCE_REGISTRY_ENTRY_SCHEMA_ID } from "../schemas/source-registry-entry.schema.js";
const validateSourceRegistryEntryInvariants = (input) => {
    const issues = [];
    if (input.ownerNotesNullable !== null && input.ownerNotesNullable.trim().length === 0) {
        issues.push(errorIssue("INVALID_SOURCE_REGISTRY_ENTRY", "/ownerNotesNullable", "ownerNotesNullable cannot be empty when provided"));
    }
    return issues;
};
export const validateSourceRegistryEntry = (input, options) => {
    const schemaValidator = requireSchemaValidator(SOURCE_REGISTRY_ENTRY_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateSourceRegistryEntryInvariants(input)];
    return buildValidationReport("SourceRegistryEntry", input.sourceDefinitionId, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-source-registry-entry.js.map