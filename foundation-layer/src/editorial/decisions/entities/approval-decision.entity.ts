import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import type { PublishableCandidateId } from "../../../publishing/value-objects/publishing-ids.vo.js";
import { ApprovalScope } from "../../enums/approval-scope.enum.js";
import type { ApprovalDecisionId, EditorialActorId } from "../../value-objects/editorial-ids.vo.js";
import { type ApprovalScore, createApprovalScore } from "../../value-objects/approval-score.vo.js";

export type ApprovalDecision = Readonly<{
  id: ApprovalDecisionId;
  version: EntityVersion;
  publishable_candidate_id: PublishableCandidateId;
  approved_by: EditorialActorId;
  approved_at: Timestamp;
  approval_scope: ApprovalScope;
  approval_notes_nullable: string | null;
  publication_readiness_score: ApprovalScore;
}>;

export const createApprovalDecision = (input: ApprovalDecision): ApprovalDecision => {
  if (!Object.values(ApprovalScope).includes(input.approval_scope)) {
    throw new ValidationError("INVALID_APPROVAL_DECISION", "approval_scope is invalid");
  }
  return deepFreeze({
    ...input,
    publication_readiness_score: createApprovalScore(input.publication_readiness_score),
  });
};
