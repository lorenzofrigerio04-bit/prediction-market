import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import type { PublishableCandidateId } from "../../../publishing/value-objects/publishing-ids.vo.js";
import { PriorityLevel } from "../../enums/priority-level.enum.js";
import { QueueStatus } from "../../enums/queue-status.enum.js";
import type { ReasonCode } from "../../enums/reason-code.enum.js";
import type { ReviewQueueEntryId, EditorialActorId } from "../../value-objects/editorial-ids.vo.js";
import type { BlockingFlag } from "../../value-objects/blocking-flag.vo.js";
import type { WarningEntry } from "../../value-objects/warning.vo.js";
import { createBlockingFlagCollection } from "../../value-objects/blocking-flag.vo.js";
import { createWarningCollection } from "../../value-objects/warning.vo.js";

export type ReviewQueueEntry = Readonly<{
  id: ReviewQueueEntryId;
  version: EntityVersion;
  publishable_candidate_id: PublishableCandidateId;
  queue_status: QueueStatus;
  priority_level: PriorityLevel;
  entered_queue_at: Timestamp;
  assigned_reviewer_nullable: EditorialActorId | null;
  queue_reason: ReasonCode;
  blocking_flags: readonly BlockingFlag[];
  warnings: readonly WarningEntry[];
}>;

export const createReviewQueueEntry = (input: ReviewQueueEntry): ReviewQueueEntry => {
  if (!Object.values(QueueStatus).includes(input.queue_status)) {
    throw new ValidationError("INVALID_REVIEW_QUEUE_ENTRY", "queue_status is invalid");
  }
  if (!Object.values(PriorityLevel).includes(input.priority_level)) {
    throw new ValidationError("INVALID_REVIEW_QUEUE_ENTRY", "priority_level is invalid");
  }
  return deepFreeze({
    ...input,
    blocking_flags: createBlockingFlagCollection(input.blocking_flags, "blocking_flags"),
    warnings: createWarningCollection(input.warnings),
  });
};
