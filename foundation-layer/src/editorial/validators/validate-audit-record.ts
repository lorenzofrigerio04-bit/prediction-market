import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { AuditRecord } from "../audit/entities/audit-record.entity.js";
import { AUDIT_RECORD_SCHEMA_ID } from "../schemas/audit-record.schema.js";

const validateAuditRecordInvariants = (input: AuditRecord): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.correlation_id.trim().length === 0) {
    issues.push(
      errorIssue("MISSING_AUDIT_CORRELATION_ID", "/correlation_id", "correlation_id is required"),
    );
  }
  return issues;
};

export const validateAuditRecord = (
  input: AuditRecord,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(AUDIT_RECORD_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateAuditRecordInvariants(input);
  return buildValidationReport(
    "AuditRecord",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
