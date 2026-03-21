import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { RoleAssignment } from "../roles/entities/role-assignment.entity.js";
import { ROLE_ASSIGNMENT_SCHEMA_ID } from "../schemas/role-assignment.schema.js";

export type RoleAssignmentValidationContext = Readonly<{
  user_exists?: (userId: RoleAssignment["user_id"]) => boolean;
  role_exists?: (roleId: RoleAssignment["role_id"]) => boolean;
}>;

const validateRoleAssignmentInvariants = (
  input: RoleAssignment,
  context?: RoleAssignmentValidationContext,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.active) {
    if (context?.user_exists !== undefined && !context.user_exists(input.user_id)) {
      issues.push(
        errorIssue(
          "ROLE_ASSIGNMENT_ACTIVE_USER_MISSING",
          "/user_id",
          "active role assignment requires a valid user in context",
        ),
      );
    }
    if (context?.role_exists !== undefined && !context.role_exists(input.role_id)) {
      issues.push(
        errorIssue(
          "ROLE_ASSIGNMENT_ACTIVE_ROLE_MISSING",
          "/role_id",
          "active role assignment requires a valid role in context",
        ),
      );
    }
  }
  return issues;
};

export const validateRoleAssignment = (
  input: RoleAssignment,
  options?: ValidationOptions,
  context?: RoleAssignmentValidationContext,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(ROLE_ASSIGNMENT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateRoleAssignmentInvariants(input, context);
  return buildValidationReport(
    "RoleAssignment",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
