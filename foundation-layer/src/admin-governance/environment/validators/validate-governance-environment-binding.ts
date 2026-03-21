import { type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import type { GovernanceEnvironmentBinding } from "../entities/governance-environment-binding.entity.js";
import { GOVERNANCE_ENVIRONMENT_BINDING_SCHEMA_ID } from "../../schemas/governance-environment-binding.schema.js";

export const validateGovernanceEnvironmentBinding = (
  input: GovernanceEnvironmentBinding,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(GOVERNANCE_ENVIRONMENT_BINDING_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  return buildValidationReport("GovernanceEnvironmentBinding", input.id, schemaIssues, resolveGeneratedAt(options));
};
