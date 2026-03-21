import { QueueStatus } from "../../enums/queue-status.enum.js";
import type { PublishableCandidate } from "../../../publishing/candidate/entities/publishable-candidate.entity.js";
import { createReviewQueueEntry, type ReviewQueueEntry } from "../entities/review-queue-entry.entity.js";
import type { ReviewQueueManager } from "../interfaces/review-queue-manager.js";

export class DeterministicReviewQueueManager implements ReviewQueueManager {
  enqueue(candidate: PublishableCandidate, entry: ReviewQueueEntry): ReviewQueueEntry {
    if (entry.publishable_candidate_id !== candidate.id) {
      throw new Error("REVIEW_QUEUE_CANDIDATE_MISMATCH");
    }
    return createReviewQueueEntry(entry);
  }

  assignReviewer(entry: ReviewQueueEntry, reviewerId: string): ReviewQueueEntry {
    return createReviewQueueEntry({
      ...entry,
      queue_status: QueueStatus.IN_REVIEW,
      assigned_reviewer_nullable: reviewerId as never,
    });
  }
}
