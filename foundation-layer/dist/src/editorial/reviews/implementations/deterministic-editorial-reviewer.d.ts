import { type EditorialReview } from "../entities/editorial-review.entity.js";
import type { EditorialReviewer } from "../interfaces/editorial-reviewer.js";
import type { ReviewQueueEntry } from "../../queue/entities/review-queue-entry.entity.js";
export declare class DeterministicEditorialReviewer implements EditorialReviewer {
    performReview(input: ReviewQueueEntry, review: EditorialReview): EditorialReview;
}
//# sourceMappingURL=deterministic-editorial-reviewer.d.ts.map