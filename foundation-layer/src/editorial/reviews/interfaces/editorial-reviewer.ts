import type { EditorialReview } from "../entities/editorial-review.entity.js";
import type { ReviewQueueEntry } from "../../queue/entities/review-queue-entry.entity.js";

export interface EditorialReviewer {
  performReview(input: ReviewQueueEntry, review: EditorialReview): EditorialReview;
}
