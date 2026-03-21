import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { DecisionStatus } from "../enums/decision-status.enum.js";
import type { AuthorizationDecision } from "../authorization/entities/authorization-decision.entity.js";
import { AUTHORIZATION_DECISION_SCHEMA_ID } from "../schemas/authorization-decision.schema.js";

const validateDecisionInvariants = (input: AuthorizationDecision): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.decision_status === DecisionStatus.DENIED && input.blocking_reasons.length === 0) {
    issues.push(
      errorIssue(
        "AUTHORIZATION_DENIED_REQUIRES_REASON",
        "/blocking_reasons",
        "DENIED decision must include at least one blocking reason",
      ),
    );
  }
  if (input.decision_status === DecisionStatus.ALLOWED && input.blocking_reasons.length > 0) {
    issues.push(
      errorIssue(
        "AUTHORIZATION_ALLOWED_REQUIRES_EMPTY_REASONS",
        "/blocking_reasons",
        "ALLOWED decision must not include blocking reasons",
      ),
    );
  }
  return issues;
};

export const validateAuthorizationDecision = (
  input: AuthorizationDecision,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(AUTHORIZATION_DECISION_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateDecisionInvariants(input);
  return buildValidationReport(
    "AuthorizationDecision",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
