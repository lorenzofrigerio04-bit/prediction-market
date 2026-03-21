import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { OBSERVABILITY_EVENT_SCHEMA_ID } from "../schemas/observability-event.schema.js";
const validateObservabilityEventInvariants = (input) => {
    const issues = [];
    if (input.correlation_id.trim().length === 0) {
        issues.push(errorIssue("MISSING_CORRELATION_ID", "/correlation_id", "ObservabilityEvent.correlationId must not be empty"));
    }
    if (input.module_name.trim().length === 0) {
        issues.push(errorIssue("MISSING_MODULE_NAME", "/module_name", "ObservabilityEvent.moduleName must not be empty"));
    }
    return issues;
};
export const validateObservabilityEvent = (input, options) => {
    const schemaValidator = requireSchemaValidator(OBSERVABILITY_EVENT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateObservabilityEventInvariants(input);
    return buildValidationReport("ObservabilityEvent", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-observability-event.js.map