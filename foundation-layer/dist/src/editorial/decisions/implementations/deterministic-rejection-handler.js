import { createRejectionDecision } from "../entities/rejection-decision.entity.js";
export class DeterministicRejectionHandler {
    reject(review, rejection) {
        if (review.publishable_candidate_id !== rejection.publishable_candidate_id) {
            throw new Error("REJECTION_CANDIDATE_MISMATCH");
        }
        return createRejectionDecision(rejection);
    }
}
//# sourceMappingURL=deterministic-rejection-handler.js.map