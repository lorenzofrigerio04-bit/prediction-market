import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import { EligibilityStatus } from "../../enums/eligibility-status.enum.js";
import type { BonusEligibility } from "../entities/bonus-eligibility.entity.js";
import { BONUS_ELIGIBILITY_SCHEMA_ID } from "../../schemas/bonus-eligibility.schema.js";

const validateInvariants = (input: BonusEligibility): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.eligibility_status === EligibilityStatus.ELIGIBLE && input.blocking_reasons.length > 0) {
    issues.push(errorIssue("BONUS_ELIGIBLE_WITH_BLOCKS", "/blocking_reasons", "eligible status requires empty blocking_reasons"));
  }
  return issues;
};

export const validateBonusEligibility = (input: BonusEligibility, options?: ValidationOptions): ValidationReport => {
  const schemaValidator = requireSchemaValidator(BONUS_ELIGIBILITY_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateInvariants(input);
  return buildValidationReport("BonusEligibility", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
