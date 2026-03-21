import { type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { ApprovalDecision } from "../decisions/entities/approval-decision.entity.js";
import { APPROVAL_DECISION_SCHEMA_ID } from "../schemas/approval-decision.schema.js";

export const validateApprovalDecision = (
  input: ApprovalDecision,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(APPROVAL_DECISION_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  return buildValidationReport("ApprovalDecision", input.id, schemaIssues, resolveGeneratedAt(options));
};
