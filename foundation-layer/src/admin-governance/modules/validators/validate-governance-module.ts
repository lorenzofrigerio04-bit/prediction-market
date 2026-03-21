import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import type { GovernanceModule } from "../entities/governance-module.entity.js";
import { GOVERNANCE_MODULE_SCHEMA_ID } from "../../schemas/governance-module.schema.js";

const validateInvariants = (input: GovernanceModule): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (new Set(input.supported_operations).size !== input.supported_operations.length) {
    issues.push(errorIssue("MODULE_OPERATIONS_DUPLICATE", "/supported_operations", "supported_operations must be unique"));
  }
  return issues;
};

export const validateGovernanceModule = (
  input: GovernanceModule,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(GOVERNANCE_MODULE_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateInvariants(input);
  return buildValidationReport("GovernanceModule", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
