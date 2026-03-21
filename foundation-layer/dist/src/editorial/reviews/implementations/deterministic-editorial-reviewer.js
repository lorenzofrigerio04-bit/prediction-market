import { createEditorialReview } from "../entities/editorial-review.entity.js";
export class DeterministicEditorialReviewer {
    performReview(input, review) {
        if (input.publishable_candidate_id !== review.publishable_candidate_id) {
            throw new Error("EDITORIAL_REVIEW_CANDIDATE_MISMATCH");
        }
        return createEditorialReview(review);
    }
}
//# sourceMappingURL=deterministic-editorial-reviewer.js.map