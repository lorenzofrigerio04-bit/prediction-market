import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { DISCOVERY_ERROR_REPORT_SCHEMA_ID } from "../schemas/discovery-error-report.schema.js";
export const validateDiscoveryErrorReport = (input, options) => {
    const schemaValidator = requireSchemaValidator(DISCOVERY_ERROR_REPORT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    return buildValidationReport("DiscoveryErrorReport", input.runId, schemaIssues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-discovery-error-report.js.map