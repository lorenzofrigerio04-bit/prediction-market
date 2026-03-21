import { QueueStatus } from "../../enums/queue-status.enum.js";
import { createReviewQueueEntry } from "../entities/review-queue-entry.entity.js";
export class DeterministicReviewQueueManager {
    enqueue(candidate, entry) {
        if (entry.publishable_candidate_id !== candidate.id) {
            throw new Error("REVIEW_QUEUE_CANDIDATE_MISMATCH");
        }
        return createReviewQueueEntry(entry);
    }
    assignReviewer(entry, reviewerId) {
        return createReviewQueueEntry({
            ...entry,
            queue_status: QueueStatus.IN_REVIEW,
            assigned_reviewer_nullable: reviewerId,
        });
    }
}
//# sourceMappingURL=deterministic-review-queue-manager.js.map