import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { GoldenDatasetEntry } from "../golden-datasets/entities/golden-dataset-entry.entity.js";
import { GOLDEN_DATASET_ENTRY_SCHEMA_ID } from "../schemas/golden-dataset-entry.schema.js";

const validateGoldenDatasetEntryInvariants = (input: GoldenDatasetEntry): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.expected_invariants.length === 0) {
    issues.push(
      errorIssue(
        "EMPTY_EXPECTED_INVARIANTS",
        "/expected_invariants",
        "GoldenDatasetEntry.expectedInvariants must not be empty",
      ),
    );
  }
  return issues;
};

export const validateGoldenDatasetEntry = (
  input: GoldenDatasetEntry,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(GOLDEN_DATASET_ENTRY_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateGoldenDatasetEntryInvariants(input);
  return buildValidationReport(
    "GoldenDatasetEntry",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
