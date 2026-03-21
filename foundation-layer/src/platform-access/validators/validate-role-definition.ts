import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { RoleDefinition } from "../roles/entities/role-definition.entity.js";
import { ROLE_DEFINITION_SCHEMA_ID } from "../schemas/role-definition.schema.js";

const validateRoleDefinitionInvariants = (input: RoleDefinition): readonly ValidationIssue[] => {
  if (input.permission_set.length === 0) {
    return [errorIssue("ROLE_PERMISSION_SET_EMPTY", "/permission_set", "permission_set must not be empty")];
  }
  return [];
};

export const validateRoleDefinition = (input: RoleDefinition, options?: ValidationOptions): ValidationReport => {
  const schemaValidator = requireSchemaValidator(ROLE_DEFINITION_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateRoleDefinitionInvariants(input);
  return buildValidationReport(
    "RoleDefinition",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
