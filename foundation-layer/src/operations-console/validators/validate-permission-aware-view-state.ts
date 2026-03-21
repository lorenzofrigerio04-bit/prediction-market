import { VisibilityStatus } from "../enums/visibility-status.enum.js";
import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { PermissionAwareViewState } from "../permissions/entities/permission-aware-view-state.entity.js";
import { PERMISSION_AWARE_VIEW_STATE_SCHEMA_ID } from "../schemas/permission-aware-view-state.schema.js";

const validatePermissionAwareStateInvariants = (input: PermissionAwareViewState): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.visibility_status === VisibilityStatus.HIDDEN && input.allowed_actions.length > 0) {
    issues.push(
      errorIssue(
        "HIDDEN_VIEW_CANNOT_HAVE_ALLOWED_ACTIONS",
        "/allowed_actions",
        "hidden view cannot expose allowed_actions",
      ),
    );
  }
  const allowedSet = new Set(input.allowed_actions);
  for (const denied of input.denied_actions) {
    if (allowedSet.has(denied)) {
      issues.push(
        errorIssue(
          "PERMISSION_ACTION_OVERLAP",
          "/",
          "allowed_actions and denied_actions must not overlap",
        ),
      );
      break;
    }
  }
  if (
    input.evaluation_basis.matched_rules.length === 0 &&
    input.evaluation_basis.deny_reasons.length === 0 &&
    input.evaluation_basis.evaluated_roles.length === 0
  ) {
    issues.push(
      errorIssue(
        "PERMISSION_EVALUATION_BASIS_INSUFFICIENT",
        "/evaluation_basis",
        "evaluation_basis must contain evidence that explains the permission outcome",
      ),
    );
  }
  return issues;
};

export const validatePermissionAwareViewState = (
  input: PermissionAwareViewState,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(PERMISSION_AWARE_VIEW_STATE_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validatePermissionAwareStateInvariants(input);
  return buildValidationReport(
    "PermissionAwareViewState",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
