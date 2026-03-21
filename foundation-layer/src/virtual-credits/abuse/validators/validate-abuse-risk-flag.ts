import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import type { AbuseRiskFlag } from "../entities/abuse-risk-flag.entity.js";
import { ABUSE_RISK_FLAG_SCHEMA_ID } from "../../schemas/abuse-risk-flag.schema.js";

const validateInvariants = (input: AbuseRiskFlag): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.active && input.related_refs.length === 0) {
    issues.push(errorIssue("ABUSE_ACTIVE_RELATED_REFS_REQUIRED", "/related_refs", "active abuse flags should include related_refs"));
  }
  return issues;
};

export const validateAbuseRiskFlag = (input: AbuseRiskFlag, options?: ValidationOptions): ValidationReport => {
  const schemaValidator = requireSchemaValidator(ABUSE_RISK_FLAG_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateInvariants(input);
  return buildValidationReport("AbuseRiskFlag", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
