import type { CanonicalEvent } from "../entities/canonical-event.entity.js";
import type { ValidationReport } from "../entities/validation-report.entity.js";
import { CANONICAL_EVENT_SCHEMA_ID } from "../schemas/entities/canonical-event.schema.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "./common/validation-result.js";
import { validateCanonicalEventInvariants } from "./domain-invariants.validator.js";

export const validateCanonicalEvent = (
  input: CanonicalEvent,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(CANONICAL_EVENT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateCanonicalEventInvariants(input)];
  return buildValidationReport(
    "CanonicalEvent",
    input.id,
    issues,
    resolveGeneratedAt(options),
  );
};
