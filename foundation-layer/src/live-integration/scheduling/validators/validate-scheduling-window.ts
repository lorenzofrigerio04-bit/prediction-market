import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import type { SchedulingWindow } from "../entities/scheduling-window.entity.js";
import { SCHEDULING_WINDOW_SCHEMA_ID } from "../../schemas/scheduling-window.schema.js";

const validateSchedulingWindowInvariants = (input: SchedulingWindow): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (Date.parse(input.start_at) >= Date.parse(input.end_at)) {
    issues.push(errorIssue("SCHEDULING_WINDOW_INVALID", "/start_at", "start_at must be earlier than end_at"));
  }
  return issues;
};

export const validateSchedulingWindow = (
  input: SchedulingWindow,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(SCHEDULING_WINDOW_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateSchedulingWindowInvariants(input);
  return buildValidationReport(
    "SchedulingWindow",
    `${input.start_at}-${input.end_at}`,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
