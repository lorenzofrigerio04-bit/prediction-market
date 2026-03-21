import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import { OpportunityStatus } from "../../enums/opportunity-status.enum.js";
import type { OpportunityAssessment } from "../entities/opportunity-assessment.entity.js";
import { OPPORTUNITY_ASSESSMENT_SCHEMA_ID } from "../../schemas/opportunity-assessment.schema.js";

const validateOpportunityAssessmentInvariants = (
  input: OpportunityAssessment,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.opportunity_status === OpportunityStatus.BLOCKED && input.blocking_reasons.length === 0) {
    issues.push(
      errorIssue(
        "INVALID_BLOCKING_CONSISTENCY",
        "/blocking_reasons",
        "blocking_reasons must be non-empty when opportunity_status is blocked",
      ),
    );
  }
  if (input.opportunity_status === OpportunityStatus.ELIGIBLE && input.blocking_reasons.length > 0) {
    issues.push(
      errorIssue(
        "INVALID_BLOCKING_CONSISTENCY",
        "/blocking_reasons",
        "blocking_reasons must be empty when opportunity_status is eligible",
      ),
    );
  }
  return issues;
};

export const validateOpportunityAssessment = (
  input: OpportunityAssessment,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(OPPORTUNITY_ASSESSMENT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateOpportunityAssessmentInvariants(input)];
  return buildValidationReport("OpportunityAssessment", input.id, issues, resolveGeneratedAt(options));
};
