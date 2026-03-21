import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import type { UsageCounter } from "../entities/usage-counter.entity.js";
import { USAGE_COUNTER_SCHEMA_ID } from "../../schemas/usage-counter.schema.js";

const validateInvariants = (input: UsageCounter): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!Number.isFinite(input.measured_value) || input.measured_value < 0) {
    issues.push(errorIssue("USAGE_COUNTER_VALUE_INVALID", "/measured_value", "measured_value must be finite and non-negative"));
  }
  if (!Number.isInteger(input.measurement_window.size) || input.measurement_window.size <= 0) {
    issues.push(errorIssue("USAGE_COUNTER_WINDOW_INVALID", "/measurement_window/size", "measurement_window.size must be positive integer"));
  }
  return issues;
};

export const validateUsageCounter = (input: UsageCounter, options?: ValidationOptions): ValidationReport => {
  const schemaValidator = requireSchemaValidator(USAGE_COUNTER_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateInvariants(input);
  return buildValidationReport("UsageCounter", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
