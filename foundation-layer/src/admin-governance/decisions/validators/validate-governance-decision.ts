import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import { GovernanceDecisionStatus } from "../../enums/governance-decision-status.enum.js";
import type { GovernanceDecision } from "../entities/governance-decision.entity.js";
import { GOVERNANCE_DECISION_SCHEMA_ID } from "../../schemas/governance-decision.schema.js";

const validateInvariants = (input: GovernanceDecision): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.status === GovernanceDecisionStatus.DENIED && input.reasons.length === 0) {
    issues.push(errorIssue("DECISION_REASON_REQUIRED", "/reasons", "reasons are required for denied decisions"));
  }
  if (new Set(input.reasons).size !== input.reasons.length) {
    issues.push(errorIssue("DECISION_REASONS_DUPLICATE", "/reasons", "reasons must be unique"));
  }
  return issues;
};

export const validateGovernanceDecision = (
  input: GovernanceDecision,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(GOVERNANCE_DECISION_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateInvariants(input);
  return buildValidationReport("GovernanceDecision", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
