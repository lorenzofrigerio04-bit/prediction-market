import { ReviewStatus } from "../../enums/review-status.enum.js";
import { createApprovalDecision, type ApprovalDecision } from "../entities/approval-decision.entity.js";
import type { EditorialReview } from "../../reviews/entities/editorial-review.entity.js";
import type { ApprovalGate } from "../interfaces/approval-gate.js";

export class DeterministicApprovalGate implements ApprovalGate {
  approve(review: EditorialReview, decision: ApprovalDecision): ApprovalDecision {
    if (review.review_status !== ReviewStatus.APPROVED_FOR_GATE) {
      throw new Error("REVIEW_NOT_APPROVED_FOR_GATE");
    }
    if (review.publishable_candidate_id !== decision.publishable_candidate_id) {
      throw new Error("APPROVAL_CANDIDATE_MISMATCH");
    }
    return createApprovalDecision(decision);
  }
}
