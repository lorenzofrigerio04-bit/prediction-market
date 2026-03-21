import type { EventSignal } from "../entities/event-signal.entity.js";
import type { ValidationReport } from "../entities/validation-report.entity.js";
import { EVENT_SIGNAL_SCHEMA_ID } from "../schemas/entities/event-signal.schema.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "./common/validation-result.js";
import { validateEventSignalInvariants } from "./domain-invariants.validator.js";

export const validateEventSignal = (
  input: EventSignal,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(EVENT_SIGNAL_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateEventSignalInvariants(input)];
  return buildValidationReport(
    "EventSignal",
    input.id,
    issues,
    resolveGeneratedAt(options),
  );
};
