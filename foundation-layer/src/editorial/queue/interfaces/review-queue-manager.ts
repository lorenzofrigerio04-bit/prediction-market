import type { ReviewQueueEntry } from "../entities/review-queue-entry.entity.js";
import type { PublishableCandidate } from "../../../publishing/candidate/entities/publishable-candidate.entity.js";

export interface ReviewQueueManager {
  enqueue(candidate: PublishableCandidate, entry: ReviewQueueEntry): ReviewQueueEntry;
  assignReviewer(entry: ReviewQueueEntry, reviewerId: string): ReviewQueueEntry;
}
