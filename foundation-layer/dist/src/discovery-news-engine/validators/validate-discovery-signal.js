import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { DISCOVERY_SIGNAL_SCHEMA_ID } from "../schemas/discovery-signal.schema.js";
export const validateDiscoverySignal = (input, options) => {
    const schemaValidator = requireSchemaValidator(DISCOVERY_SIGNAL_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues];
    return buildValidationReport("DiscoverySignal", input.id, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-discovery-signal.js.map