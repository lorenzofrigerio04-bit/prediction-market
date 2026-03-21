import { type ValidationIssue, type ValidationReport, errorIssue } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { SourcePolicyRender } from "../rendering/entities/source-policy-render.entity.js";
import { SOURCE_POLICY_RENDER_SCHEMA_ID } from "../schemas/source-policy-render.schema.js";

const validateSourcePolicyRenderInvariants = (input: SourcePolicyRender): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.selected_source_priority.length === 0) {
    issues.push(
      errorIssue(
        "EMPTY_SELECTED_SOURCE_PRIORITY",
        "/selected_source_priority",
        "selected_source_priority must be non-empty",
      ),
    );
  }
  return issues;
};

export const validateSourcePolicyRender = (
  input: SourcePolicyRender,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(SOURCE_POLICY_RENDER_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateSourcePolicyRenderInvariants(input)];
  return buildValidationReport(
    "SourcePolicyRender",
    input.selected_source_priority[0] ?? "source-policy",
    issues,
    resolveGeneratedAt(options),
  );
};
