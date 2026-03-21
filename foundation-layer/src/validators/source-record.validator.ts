import type { SourceRecord } from "../entities/source-record.entity.js";
import type { ValidationReport } from "../entities/validation-report.entity.js";
import { SOURCE_RECORD_SCHEMA_ID } from "../schemas/entities/source-record.schema.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "./common/validation-result.js";
import { validateSourceRecordInvariants } from "./domain-invariants.validator.js";

export const validateSourceRecord = (
  input: SourceRecord,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(SOURCE_RECORD_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateSourceRecordInvariants(input)];
  return buildValidationReport(
    "SourceRecord",
    input.id,
    issues,
    resolveGeneratedAt(options),
  );
};
