import {
  errorIssue,
  type ValidationIssue,
  type ValidationReport,
} from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { ObservationNormalizationResult } from "../interfaces/observation-normalization-result.js";
import { OBSERVATION_NORMALIZATION_RESULT_SCHEMA_ID } from "../schemas/observation-normalization-result.schema.js";

const validateObservationNormalizationResultInvariants = (
  input: ObservationNormalizationResult,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const expectedComplete =
    input.traceabilityCompleteness.hasSourceReference &&
    input.traceabilityCompleteness.hasRawPayloadReference &&
    input.traceabilityCompleteness.hasEvidenceSpans &&
    input.traceabilityCompleteness.hasTraceabilityMetadata;

  if (input.traceabilityCompleteness.isComplete !== expectedComplete) {
    issues.push(
      errorIssue(
        "TRACEABILITY_COMPLETENESS_MISMATCH",
        "/traceabilityCompleteness/isComplete",
        "isComplete must match explicit completeness flags",
      ),
    );
  }
  return issues;
};

export const validateObservationNormalizationResult = (
  input: ObservationNormalizationResult,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(OBSERVATION_NORMALIZATION_RESULT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateObservationNormalizationResultInvariants(input)];
  return buildValidationReport(
    "ObservationNormalizationResult",
    input.observation.id,
    issues,
    resolveGeneratedAt(options),
  );
};
