import { createEditorialReview, type EditorialReview } from "../entities/editorial-review.entity.js";
import type { EditorialReviewer } from "../interfaces/editorial-reviewer.js";
import type { ReviewQueueEntry } from "../../queue/entities/review-queue-entry.entity.js";

export class DeterministicEditorialReviewer implements EditorialReviewer {
  performReview(input: ReviewQueueEntry, review: EditorialReview): EditorialReview {
    if (input.publishable_candidate_id !== review.publishable_candidate_id) {
      throw new Error("EDITORIAL_REVIEW_CANDIDATE_MISMATCH");
    }
    return createEditorialReview(review);
  }
}
