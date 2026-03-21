import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import type { PublishableCandidateId } from "../../../publishing/value-objects/publishing-ids.vo.js";
import { ReviewStatus } from "../../enums/review-status.enum.js";
import type { ReasonCode } from "../../enums/reason-code.enum.js";
import type { EditorialReviewId, EditorialActorId } from "../../value-objects/editorial-ids.vo.js";
import type { RequiredAction } from "../../value-objects/required-action.vo.js";
import type { SeveritySummary, FindingSeverity } from "../../value-objects/severity-summary.vo.js";
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
export declare const createEditorialReview: (input: EditorialReview) => EditorialReview;
//# sourceMappingURL=editorial-review.entity.d.ts.map