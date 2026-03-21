import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import { ReadinessStatus } from "../../enums/readiness-status.enum.js";
import { SchedulingStatus } from "../../enums/scheduling-status.enum.js";
import type { SchedulingCandidate } from "../entities/scheduling-candidate.entity.js";
import { SCHEDULING_CANDIDATE_SCHEMA_ID } from "../../schemas/scheduling-candidate.schema.js";

const validateSchedulingCandidateInvariants = (input: SchedulingCandidate): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.publication_package_id.trim().length === 0) {
    issues.push(errorIssue("PUBLICATION_PACKAGE_REQUIRED", "/publication_package_id", "publication_package_id is required"));
  }
  if (
    (input.readiness_status === ReadinessStatus.BLOCKED || input.readiness_status === ReadinessStatus.FAILED) &&
    input.scheduling_status === SchedulingStatus.READY
  ) {
    issues.push(
      errorIssue(
        "SCHEDULING_READY_WITH_FAILED_READINESS",
        "/scheduling_status",
        "candidate cannot be READY when readiness_status is FAILED or BLOCKED",
      ),
    );
  }
  if (
    input.scheduling_status === SchedulingStatus.READY &&
    input.delivery_readiness_report_id === null
  ) {
    issues.push(
      errorIssue(
        "READINESS_REPORT_REQUIRED",
        "/delivery_readiness_report_id",
        "READY scheduling candidate requires delivery_readiness_report_id",
      ),
    );
  }
  return issues;
};

export const validateSchedulingCandidate = (
  input: SchedulingCandidate,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(SCHEDULING_CANDIDATE_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateSchedulingCandidateInvariants(input);
  return buildValidationReport(
    "SchedulingCandidate",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
