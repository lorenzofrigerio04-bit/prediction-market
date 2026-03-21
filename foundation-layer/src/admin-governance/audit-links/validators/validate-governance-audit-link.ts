import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import type { GovernanceAuditLink } from "../entities/governance-audit-link.entity.js";
import { GOVERNANCE_AUDIT_LINK_SCHEMA_ID } from "../../schemas/governance-audit-link.schema.js";

const validateInvariants = (input: GovernanceAuditLink): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.decision_ref_nullable === null && input.override_ref_nullable === null) {
    issues.push(errorIssue("AUDIT_LINK_TARGET_REQUIRED", "/decision_ref_nullable", "either decision_ref_nullable or override_ref_nullable must be set"));
  }
  return issues;
};

export const validateGovernanceAuditLink = (
  input: GovernanceAuditLink,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(GOVERNANCE_AUDIT_LINK_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateInvariants(input);
  return buildValidationReport("GovernanceAuditLink", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
