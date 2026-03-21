import { errorIssue, } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { DISCOVERY_RUN_DEFINITION_SCHEMA_ID } from "../schemas/discovery-run-definition.schema.js";
const validateDiscoveryRunDefinitionInvariants = (input) => {
    const issues = [];
    if (input.sourceIds.length === 0) {
        issues.push(errorIssue("INVALID_DISCOVERY_RUN_DEFINITION", "/sourceIds", "sourceIds must contain at least one source"));
    }
    return issues;
};
export const validateDiscoveryRunDefinition = (input, options) => {
    const schemaValidator = requireSchemaValidator(DISCOVERY_RUN_DEFINITION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [
        ...schemaIssues,
        ...validateDiscoveryRunDefinitionInvariants(input),
    ];
    return buildValidationReport("DiscoveryRunDefinition", input.runId, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-discovery-run-definition.js.map