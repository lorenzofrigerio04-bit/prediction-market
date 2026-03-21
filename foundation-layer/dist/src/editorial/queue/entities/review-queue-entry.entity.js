import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { PriorityLevel } from "../../enums/priority-level.enum.js";
import { QueueStatus } from "../../enums/queue-status.enum.js";
import { createBlockingFlagCollection } from "../../value-objects/blocking-flag.vo.js";
import { createWarningCollection } from "../../value-objects/warning.vo.js";
export const createReviewQueueEntry = (input) => {
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
//# sourceMappingURL=review-queue-entry.entity.js.map