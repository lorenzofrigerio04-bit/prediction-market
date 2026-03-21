import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import type { GovernanceSource } from "../entities/governance-source.entity.js";
import { GOVERNANCE_SOURCE_SCHEMA_ID } from "../../schemas/governance-source.schema.js";

const validateInvariants = (input: GovernanceSource): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.trust_weight < 0 || input.trust_weight > 1) {
    issues.push(errorIssue("SOURCE_TRUST_WEIGHT_OUT_OF_RANGE", "/trust_weight", "trust_weight must be in range [0,1]"));
  }
  return issues;
};

export const validateGovernanceSource = (
  input: GovernanceSource,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(GOVERNANCE_SOURCE_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateInvariants(input);
  return buildValidationReport("GovernanceSource", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
