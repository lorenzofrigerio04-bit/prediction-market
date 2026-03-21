import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import { ConsumptionStatus } from "../../enums/consumption-status.enum.js";
import type { CreditConsumptionEvent } from "../entities/credit-consumption-event.entity.js";
import { CREDIT_CONSUMPTION_EVENT_SCHEMA_ID } from "../../schemas/credit-consumption-event.schema.js";

const validateInvariants = (input: CreditConsumptionEvent): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.consumption_status === ConsumptionStatus.COMPLETED && !(input.consumption_amount > 0)) {
    issues.push(errorIssue("CONSUMPTION_COMPLETED_AMOUNT_INVALID", "/consumption_amount", "completed consumption requires amount > 0"));
  }
  if (input.consumption_status === ConsumptionStatus.REJECTED && input.consumption_amount < 0) {
    issues.push(errorIssue("CONSUMPTION_REJECTED_AMOUNT_INVALID", "/consumption_amount", "rejected consumption cannot be negative"));
  }
  if (!Number.isFinite(input.consumption_amount)) {
    issues.push(errorIssue("CONSUMPTION_AMOUNT_INVALID", "/consumption_amount", "consumption_amount must be finite"));
  }
  return issues;
};

export const validateCreditConsumptionEvent = (
  input: CreditConsumptionEvent,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(CREDIT_CONSUMPTION_EVENT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateInvariants(input);
  return buildValidationReport(
    "CreditConsumptionEvent",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
