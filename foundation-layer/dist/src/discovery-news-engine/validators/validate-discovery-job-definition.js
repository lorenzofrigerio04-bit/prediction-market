import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { DISCOVERY_JOB_DEFINITION_SCHEMA_ID } from "../schemas/discovery-job-definition.schema.js";
export const validateDiscoveryJobDefinition = (input, options) => {
    const schemaValidator = requireSchemaValidator(DISCOVERY_JOB_DEFINITION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    return buildValidationReport("DiscoveryJobDefinition", input.jobId, schemaIssues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-discovery-job-definition.js.map