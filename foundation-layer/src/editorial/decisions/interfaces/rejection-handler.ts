import type { RejectionDecision } from "../entities/rejection-decision.entity.js";
import type { EditorialReview } from "../../reviews/entities/editorial-review.entity.js";

export interface RejectionHandler {
  reject(review: EditorialReview, rejection: RejectionDecision): RejectionDecision;
}
