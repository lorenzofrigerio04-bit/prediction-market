import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { ConditionalValidationStatus } from "../enums/conditional-validation-status.enum.js";
import { CONDITIONAL_MARKET_DEFINITION_SCHEMA_ID } from "../schemas/conditional-market-definition.schema.js";
import type { ConditionalMarketDefinition } from "../conditional/entities/conditional-market-definition.entity.js";

const validateConditionalInvariants = (input: ConditionalMarketDefinition): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.trigger_condition.triggering_outcome.trim().length === 0) {
    issues.push(
      errorIssue(
        "CONDITIONAL_TRIGGER_REQUIRED",
        "/trigger_condition",
        "conditional market must have explicit trigger condition",
      ),
    );
  }
  if (
    input.conditional_validation_status === ConditionalValidationStatus.ACTIVE_READY &&
    input.trigger_condition.triggering_outcome.trim().length === 0
  ) {
    issues.push(
      errorIssue(
        "CONDITIONAL_ACTIVE_READY_INVALID",
        "/conditional_validation_status",
        "conditional market cannot be active-ready when trigger is undefined",
      ),
    );
  }
  return issues;
};

export const validateConditionalMarketDefinition = (
  input: ConditionalMarketDefinition,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(CONDITIONAL_MARKET_DEFINITION_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateConditionalInvariants(input);
  return buildValidationReport(
    "ConditionalMarketDefinition",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
