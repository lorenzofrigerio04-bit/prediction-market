import { reviewQueueEntrySchema } from "./review-queue-entry.schema.js";
import { editorialReviewSchema } from "./editorial-review.schema.js";
import { approvalDecisionSchema } from "./approval-decision.schema.js";
import { rejectionDecisionSchema } from "./rejection-decision.schema.js";
import { manualOverrideSchema } from "./manual-override.schema.js";
import { auditRecordSchema } from "./audit-record.schema.js";
import { revisionRecordSchema } from "./revision-record.schema.js";
import { publicationReadyArtifactSchema } from "./publication-ready-artifact.schema.js";
import { controlledStateTransitionSchema } from "./controlled-state-transition.schema.js";

export const editorialSchemas = [
  reviewQueueEntrySchema,
  editorialReviewSchema,
  approvalDecisionSchema,
  rejectionDecisionSchema,
  manualOverrideSchema,
  auditRecordSchema,
  revisionRecordSchema,
  publicationReadyArtifactSchema,
  controlledStateTransitionSchema,
] as const;

export {
  reviewQueueEntrySchema,
  editorialReviewSchema,
  approvalDecisionSchema,
  rejectionDecisionSchema,
  manualOverrideSchema,
  auditRecordSchema,
  revisionRecordSchema,
  publicationReadyArtifactSchema,
  controlledStateTransitionSchema,
};
