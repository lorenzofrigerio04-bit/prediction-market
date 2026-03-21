import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import type { PublishableCandidateId } from "../../../publishing/value-objects/publishing-ids.vo.js";
import { ReviewStatus } from "../../enums/review-status.enum.js";
import type { ReasonCode } from "../../enums/reason-code.enum.js";
import type { EditorialReviewId, EditorialActorId } from "../../value-objects/editorial-ids.vo.js";
import type { RequiredAction } from "../../value-objects/required-action.vo.js";
import type { SeveritySummary, FindingSeverity } from "../../value-objects/severity-summary.vo.js";
import { createRequiredActionCollection } from "../../value-objects/required-action.vo.js";
import { createSeveritySummary } from "../../value-objects/severity-summary.vo.js";

export type ReviewFinding = Readonly<{
  code: ReasonCode;
  severity: FindingSeverity;
  message: string;
  path: string;
}>;

export type EditorialReview = Readonly<{
  id: EditorialReviewId;
  version: EntityVersion;
  publishable_candidate_id: PublishableCandidateId;
  review_status: ReviewStatus;
  reviewer_id: EditorialActorId;
  reviewed_at: Timestamp;
  findings: readonly ReviewFinding[];
  required_actions: readonly RequiredAction[];
  review_notes_nullable: string | null;
  severity_summary: SeveritySummary;
}>;

const normalizeSeveritySummary = (findings: readonly ReviewFinding[]): SeveritySummary => {
  const low = findings.filter((item) => item.severity === "low").length;
  const medium = findings.filter((item) => item.severity === "medium").length;
  const high = findings.filter((item) => item.severity === "high").length;
  const critical = findings.filter((item) => item.severity === "critical").length;
  return createSeveritySummary({ low, medium, high, critical });
};

export const createEditorialReview = (input: EditorialReview): EditorialReview => {
  if (!Object.values(ReviewStatus).includes(input.review_status)) {
    throw new ValidationError("INVALID_EDITORIAL_REVIEW", "review_status is invalid");
  }
  if (input.findings.some((item) => item.message.trim().length === 0 || item.path.trim().length === 0)) {
    throw new ValidationError("INVALID_EDITORIAL_REVIEW", "findings require non-empty message and path");
  }
  const recomputedSummary = normalizeSeveritySummary(input.findings);
  if (
    recomputedSummary.total_findings !== input.severity_summary.total_findings ||
    recomputedSummary.highest_severity !== input.severity_summary.highest_severity ||
    recomputedSummary.low !== input.severity_summary.low ||
    recomputedSummary.medium !== input.severity_summary.medium ||
    recomputedSummary.high !== input.severity_summary.high ||
    recomputedSummary.critical !== input.severity_summary.critical
  ) {
    throw new ValidationError(
      "INCONSISTENT_SEVERITY_SUMMARY",
      "severity_summary must match findings severities",
    );
  }
  return deepFreeze({
    ...input,
    findings: deepFreeze([...input.findings]),
    required_actions: createRequiredActionCollection(input.required_actions),
  });
};
