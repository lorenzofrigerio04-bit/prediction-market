import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import { buildValidationReport, resolveGeneratedAt, type ValidationOptions } from "../../validators/common/validation-result.js";
import type { PublishableCandidate } from "../../publishing/candidate/entities/publishable-candidate.entity.js";
import type { ReviewQueueEntry } from "../queue/entities/review-queue-entry.entity.js";

const validateCompatibility = (
  candidate: PublishableCandidate,
  queueEntry: ReviewQueueEntry,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (candidate.id !== queueEntry.publishable_candidate_id) {
    issues.push(
      errorIssue(
        "PUBLISHABLE_CANDIDATE_ID_MISMATCH",
        "/publishable_candidate_id",
        "review queue entry must reference the provided publishable candidate",
      ),
    );
  }
  if (candidate.blocking_issues.length > 0 && queueEntry.blocking_flags.length === 0) {
    issues.push(
      errorIssue(
        "BLOCKING_FLAGS_NOT_CARRIED_OVER",
        "/blocking_flags",
        "queue entry must include blocking flags derived from publishable candidate blocking issues",
      ),
    );
  }
  return issues;
};

export type PublishableCandidateEditorialCompatibilityInput = Readonly<{
  candidate: PublishableCandidate;
  queue_entry: ReviewQueueEntry;
}>;

export const validatePublishableCandidateEditorialCompatibility = (
  input: PublishableCandidateEditorialCompatibilityInput,
  options?: ValidationOptions,
): ValidationReport =>
  buildValidationReport(
    "PublishableCandidateEditorialCompatibility",
    input.candidate.id,
    validateCompatibility(input.candidate, input.queue_entry),
    resolveGeneratedAt(options),
  );
