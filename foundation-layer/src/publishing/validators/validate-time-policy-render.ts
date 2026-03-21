import { type ValidationIssue, type ValidationReport, errorIssue } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { TimePolicyRender } from "../rendering/entities/time-policy-render.entity.js";
import { TIME_POLICY_RENDER_SCHEMA_ID } from "../schemas/time-policy-render.schema.js";

const validateTimePolicyRenderInvariants = (input: TimePolicyRender): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.timezone.trim().length === 0) {
    issues.push(errorIssue("EMPTY_TIMEZONE", "/timezone", "timezone is required"));
  }
  return issues;
};

export const validateTimePolicyRender = (
  input: TimePolicyRender,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(TIME_POLICY_RENDER_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateTimePolicyRenderInvariants(input)];
  return buildValidationReport("TimePolicyRender", input.timezone, issues, resolveGeneratedAt(options));
};
