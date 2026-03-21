import { createRejectionDecision, type RejectionDecision } from "../entities/rejection-decision.entity.js";
import type { EditorialReview } from "../../reviews/entities/editorial-review.entity.js";
import type { RejectionHandler } from "../interfaces/rejection-handler.js";

export class DeterministicRejectionHandler implements RejectionHandler {
  reject(review: EditorialReview, rejection: RejectionDecision): RejectionDecision {
    if (review.publishable_candidate_id !== rejection.publishable_candidate_id) {
      throw new Error("REJECTION_CANDIDATE_MISMATCH");
    }
    return createRejectionDecision(rejection);
  }
}
