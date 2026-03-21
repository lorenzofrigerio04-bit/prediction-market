import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import { ReleaseReadinessStatus } from "../enums/release-readiness-status.enum.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { PipelineHealthSnapshot } from "../pipeline-health/entities/pipeline-health-snapshot.entity.js";
import { PIPELINE_HEALTH_SNAPSHOT_SCHEMA_ID } from "../schemas/pipeline-health-snapshot.schema.js";

const validatePipelineHealthSnapshotInvariants = (
  input: PipelineHealthSnapshot,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.release_readiness_status === ReleaseReadinessStatus.READY && input.blocking_issues.length > 0) {
    issues.push(
      errorIssue(
        "READY_WITH_BLOCKING_ISSUES",
        "/release_readiness_status",
        "PipelineHealthSnapshot.releaseReadinessStatus cannot be READY when blockingIssues are present",
      ),
    );
  }
  return issues;
};

export const validatePipelineHealthSnapshot = (
  input: PipelineHealthSnapshot,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(PIPELINE_HEALTH_SNAPSHOT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validatePipelineHealthSnapshotInvariants(input);
  return buildValidationReport(
    "PipelineHealthSnapshot",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
