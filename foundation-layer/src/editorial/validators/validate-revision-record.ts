import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { RevisionRecord } from "../revisions/entities/revision-record.entity.js";
import { REVISION_RECORD_SCHEMA_ID } from "../schemas/revision-record.schema.js";

const validateRevisionRecordInvariants = (input: RevisionRecord): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.changed_fields.length === 0) {
    issues.push(
      errorIssue("MISSING_CHANGED_FIELDS", "/changed_fields", "changed_fields must not be empty"),
    );
  }
  return issues;
};

export const validateRevisionRecord = (
  input: RevisionRecord,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(REVISION_RECORD_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateRevisionRecordInvariants(input);
  return buildValidationReport(
    "RevisionRecord",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
