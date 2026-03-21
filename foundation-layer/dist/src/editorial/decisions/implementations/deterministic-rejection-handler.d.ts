import { type RejectionDecision } from "../entities/rejection-decision.entity.js";
import type { EditorialReview } from "../../reviews/entities/editorial-review.entity.js";
import type { RejectionHandler } from "../interfaces/rejection-handler.js";
export declare class DeterministicRejectionHandler implements RejectionHandler {
    reject(review: EditorialReview, rejection: RejectionDecision): RejectionDecision;
}
//# sourceMappingURL=deterministic-rejection-handler.d.ts.map