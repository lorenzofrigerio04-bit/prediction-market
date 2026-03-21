import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { ObservabilityEvent } from "../observability/entities/observability-event.entity.js";
import { OBSERVABILITY_EVENT_SCHEMA_ID } from "../schemas/observability-event.schema.js";

const validateObservabilityEventInvariants = (input: ObservabilityEvent): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.correlation_id.trim().length === 0) {
    issues.push(
      errorIssue(
        "MISSING_CORRELATION_ID",
        "/correlation_id",
        "ObservabilityEvent.correlationId must not be empty",
      ),
    );
  }
  if (input.module_name.trim().length === 0) {
    issues.push(
      errorIssue("MISSING_MODULE_NAME", "/module_name", "ObservabilityEvent.moduleName must not be empty"),
    );
  }
  return issues;
};

export const validateObservabilityEvent = (
  input: ObservabilityEvent,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(OBSERVABILITY_EVENT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateObservabilityEventInvariants(input);
  return buildValidationReport(
    "ObservabilityEvent",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
