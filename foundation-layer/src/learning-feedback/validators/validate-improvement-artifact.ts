import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { IMPROVEMENT_ARTIFACT_SCHEMA_ID } from "../schemas/improvement-artifact.schema.js";
import type { ImprovementArtifact } from "../improvements/entities/improvement-artifact.entity.js";

const validateImprovementArtifactInvariants = (input: ImprovementArtifact): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.correlation_id.trim().length === 0) {
    issues.push(
      errorIssue("IMPROVEMENT_CORRELATION_ID_REQUIRED", "/correlation_id", "correlation_id is required"),
    );
  }
  if (input.safety_constraints.length === 0) {
    issues.push(
      errorIssue(
        "IMPROVEMENT_SAFETY_CONSTRAINTS_REQUIRED",
        "/safety_constraints",
        "safety_constraints must be non-empty",
      ),
    );
  }
  if (input.derived_from_refs.length === 0) {
    issues.push(
      errorIssue(
        "IMPROVEMENT_DERIVED_FROM_REFS_REQUIRED",
        "/derived_from_refs",
        "derived_from_refs must be non-empty",
      ),
    );
  }
  return issues;
};

export const validateImprovementArtifact = (
  input: ImprovementArtifact,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(IMPROVEMENT_ARTIFACT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateImprovementArtifactInvariants(input);
  return buildValidationReport(
    "ImprovementArtifact",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
