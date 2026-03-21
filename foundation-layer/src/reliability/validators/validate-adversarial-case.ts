import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { AdversarialCase } from "../adversarial/entities/adversarial-case.entity.js";
import { ADVERSARIAL_CASE_SCHEMA_ID } from "../schemas/adversarial-case.schema.js";

const validateAdversarialCaseInvariants = (input: AdversarialCase): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.active && input.expected_rejection_or_behavior.trim().length === 0) {
    issues.push(
      errorIssue(
        "ACTIVE_ADVERSARIAL_EXPECTED_BEHAVIOR_REQUIRED",
        "/expected_rejection_or_behavior",
        "AdversarialCase.expectedRejectionOrBehavior is required when active is true",
      ),
    );
  }
  return issues;
};

export const validateAdversarialCase = (
  input: AdversarialCase,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(ADVERSARIAL_CASE_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateAdversarialCaseInvariants(input);
  return buildValidationReport(
    "AdversarialCase",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
