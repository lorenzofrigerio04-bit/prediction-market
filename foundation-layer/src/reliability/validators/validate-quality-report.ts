import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { QualityReport } from "../reports/entities/quality-report.entity.js";
import { QUALITY_REPORT_SCHEMA_ID } from "../schemas/quality-report.schema.js";

const validateQualityReportInvariants = (input: QualityReport): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.summary.trim().length === 0) {
    issues.push(
      errorIssue("EMPTY_REPORT_SUMMARY", "/summary", "QualityReport.summary must not be empty"),
    );
  }
  return issues;
};

export const validateQualityReport = (
  input: QualityReport,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(QUALITY_REPORT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateQualityReportInvariants(input);
  return buildValidationReport(
    "QualityReport",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
