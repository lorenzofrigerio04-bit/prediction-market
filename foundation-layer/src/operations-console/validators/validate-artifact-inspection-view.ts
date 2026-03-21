import { ArtifactType } from "../enums/artifact-type.enum.js";
import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { ArtifactInspectionView } from "../inspection/entities/artifact-inspection-view.entity.js";
import { ARTIFACT_INSPECTION_VIEW_SCHEMA_ID } from "../schemas/artifact-inspection-view.schema.js";

const inferArtifactTypeFromRef = (artifactRef: string): ArtifactType | null => {
  if (artifactRef.includes("candidate")) {
    return ArtifactType.CANDIDATE_MARKET;
  }
  if (artifactRef.includes("review")) {
    return ArtifactType.EDITORIAL_REVIEW;
  }
  if (artifactRef.includes("publication")) {
    return ArtifactType.PUBLICATION_PACKAGE;
  }
  if (artifactRef.includes("reliability")) {
    return ArtifactType.RELIABILITY_REPORT;
  }
  return null;
};

const validateArtifactInspectionInvariants = (input: ArtifactInspectionView): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.artifact_ref.trim().length === 0 || input.artifact_ref.startsWith("arf_") === false) {
    issues.push(errorIssue("ARTIFACT_REF_INVALID", "/artifact_ref", "artifact_ref must be valid and prefixed"));
  }
  const inferredType = inferArtifactTypeFromRef(input.artifact_ref);
  if (inferredType !== null && inferredType !== input.artifact_type) {
    issues.push(
      errorIssue(
        "ARTIFACT_TYPE_TARGET_MISMATCH",
        "/artifact_type",
        `artifact_type ${input.artifact_type} is inconsistent with artifact_ref ${input.artifact_ref}`,
      ),
    );
  }
  if (input.validation_snapshot.is_valid && input.validation_snapshot.blocking_issue_count > 0) {
    issues.push(
      errorIssue(
        "VALIDATION_SNAPSHOT_IMPOSSIBLE_COMBINATION",
        "/validation_snapshot",
        "is_valid cannot be true when blocking_issue_count is greater than zero",
      ),
    );
  }
  if (input.validation_snapshot.is_valid && !input.compatibility_snapshot.is_compatible) {
    issues.push(
      errorIssue(
        "VALIDATION_COMPATIBILITY_CONTRADICTION",
        "/compatibility_snapshot",
        "valid artifacts cannot be marked incompatible in this deterministic contract",
      ),
    );
  }
  if (new Set(input.related_refs).size !== input.related_refs.length) {
    issues.push(errorIssue("RELATED_REFS_DUPLICATE", "/related_refs", "related_refs must be unique"));
  }
  return issues;
};

export const validateArtifactInspectionView = (
  input: ArtifactInspectionView,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(ARTIFACT_INSPECTION_VIEW_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateArtifactInspectionInvariants(input);
  return buildValidationReport(
    "ArtifactInspectionView",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
