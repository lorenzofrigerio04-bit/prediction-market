import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import type { PublishableCandidateId } from "../../../publishing/value-objects/publishing-ids.vo.js";
import { ApprovalScope } from "../../enums/approval-scope.enum.js";
import type { ApprovalDecisionId, EditorialActorId } from "../../value-objects/editorial-ids.vo.js";
import { type ApprovalScore } from "../../value-objects/approval-score.vo.js";
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
export declare const createApprovalDecision: (input: ApprovalDecision) => ApprovalDecision;
//# sourceMappingURL=approval-decision.entity.d.ts.map