import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { PermissionPolicy } from "../permissions/entities/permission-policy.entity.js";
import { PERMISSION_POLICY_SCHEMA_ID } from "../schemas/permission-policy.schema.js";

const validatePermissionPolicyInvariants = (input: PermissionPolicy): readonly ValidationIssue[] => {
  if (input.allowed_actions.length === 0) {
    return [errorIssue("POLICY_ALLOWED_ACTIONS_EMPTY", "/allowed_actions", "allowed_actions must not be empty")];
  }
  return [];
};

export const validatePermissionPolicy = (
  input: PermissionPolicy,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(PERMISSION_POLICY_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validatePermissionPolicyInvariants(input);
  return buildValidationReport(
    "PermissionPolicy",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
