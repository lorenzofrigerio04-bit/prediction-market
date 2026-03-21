import { ReviewStatus } from "../../enums/review-status.enum.js";
import { createApprovalDecision } from "../entities/approval-decision.entity.js";
export class DeterministicApprovalGate {
    approve(review, decision) {
        if (review.review_status !== ReviewStatus.APPROVED_FOR_GATE) {
            throw new Error("REVIEW_NOT_APPROVED_FOR_GATE");
        }
        if (review.publishable_candidate_id !== decision.publishable_candidate_id) {
            throw new Error("APPROVAL_CANDIDATE_MISMATCH");
        }
        return createApprovalDecision(decision);
    }
}
//# sourceMappingURL=deterministic-approval-gate.js.map