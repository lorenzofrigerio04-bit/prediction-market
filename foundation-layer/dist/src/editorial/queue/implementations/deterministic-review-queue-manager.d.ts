import type { PublishableCandidate } from "../../../publishing/candidate/entities/publishable-candidate.entity.js";
import { type ReviewQueueEntry } from "../entities/review-queue-entry.entity.js";
import type { ReviewQueueManager } from "../interfaces/review-queue-manager.js";
export declare class DeterministicReviewQueueManager implements ReviewQueueManager {
    enqueue(candidate: PublishableCandidate, entry: ReviewQueueEntry): ReviewQueueEntry;
    assignReviewer(entry: ReviewQueueEntry, reviewerId: string): ReviewQueueEntry;
}
//# sourceMappingURL=deterministic-review-queue-manager.d.ts.map