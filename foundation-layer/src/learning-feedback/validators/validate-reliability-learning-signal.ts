import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { PatternStatus } from "../enums/pattern-status.enum.js";
import { ReleaseImpact } from "../enums/release-impact.enum.js";
import { RELIABILITY_LEARNING_SIGNAL_SCHEMA_ID } from "../schemas/reliability-learning-signal.schema.js";
import type { ReliabilityLearningSignal } from "../signals/reliability/entities/reliability-learning-signal.entity.js";

const validateReliabilityInvariants = (input: ReliabilityLearningSignal): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.correlation_id.trim().length === 0) {
    issues.push(errorIssue("RELIABILITY_CORRELATION_ID_REQUIRED", "/correlation_id", "correlation_id is required"));
  }
  if (input.active_pattern && input.occurrence_count <= 0) {
    issues.push(
      errorIssue(
        "RELIABILITY_ACTIVE_PATTERN_COUNT_INVALID",
        "/occurrence_count",
        "active pattern requires occurrence_count > 0",
      ),
    );
  }
  if (input.active_pattern && input.pattern_status !== PatternStatus.ACTIVE) {
    issues.push(
      errorIssue(
        "RELIABILITY_ACTIVE_PATTERN_STATUS_INVALID",
        "/pattern_status",
        "active pattern requires pattern_status=active",
      ),
    );
  }
  if (input.active_pattern && input.evidence_refs.length === 0) {
    issues.push(
      errorIssue(
        "RELIABILITY_ACTIVE_PATTERN_EVIDENCE_MISSING",
        "/evidence_refs",
        "active pattern requires non-empty evidence_refs",
      ),
    );
  }
  if (
    (input.release_impact === ReleaseImpact.HIGH || input.release_impact === ReleaseImpact.CRITICAL) &&
    (input.safe_to_ignore || input.ignored_ready)
  ) {
    issues.push(
      errorIssue(
        "RELIABILITY_RELEASE_IMPACT_SEMANTIC_CONFLICT",
        "/release_impact",
        "high/critical release_impact cannot be safe_to_ignore or ignored_ready",
      ),
    );
  }
  return issues;
};

export const validateReliabilityLearningSignal = (
  input: ReliabilityLearningSignal,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(RELIABILITY_LEARNING_SIGNAL_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateReliabilityInvariants(input);
  return buildValidationReport(
    "ReliabilityLearningSignal",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
