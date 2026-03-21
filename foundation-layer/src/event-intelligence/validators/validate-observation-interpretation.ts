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
import type { ObservationInterpretation } from "../interpretation/entities/observation-interpretation.entity.js";
import { OBSERVATION_INTERPRETATION_SCHEMA_ID } from "../schemas/observation-interpretation.schema.js";

const validateObservationInterpretationInvariants = (
  input: ObservationInterpretation,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (
    input.interpreted_entities.length === 0 &&
    input.interpreted_dates.length === 0 &&
    input.interpreted_numbers.length === 0 &&
    input.interpreted_claims.length === 0
  ) {
    issues.push(
      errorIssue(
        "EMPTY_INTERPRETATION",
        "/interpreted_entities",
        "at least one interpreted_* collection must contain data",
      ),
    );
  }
  return issues;
};

export const validateObservationInterpretation = (
  input: ObservationInterpretation,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(OBSERVATION_INTERPRETATION_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateObservationInterpretationInvariants(input)];
  return buildValidationReport(
    "ObservationInterpretation",
    input.id,
    issues,
    resolveGeneratedAt(options),
  );
};
