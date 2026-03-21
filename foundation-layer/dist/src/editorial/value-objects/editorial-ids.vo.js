import { createPrefixedId } from "../../common/utils/id.js";
export const createReviewQueueEntryId = (value) => createPrefixedId(value, "rqe_", "ReviewQueueEntryId");
export const createEditorialReviewId = (value) => createPrefixedId(value, "edrev_", "EditorialReviewId");
export const createApprovalDecisionId = (value) => createPrefixedId(value, "apd_", "ApprovalDecisionId");
export const createRejectionDecisionId = (value) => createPrefixedId(value, "rjd_", "RejectionDecisionId");
export const createManualOverrideId = (value) => createPrefixedId(value, "ovr_", "ManualOverrideId");
export const createAuditRecordId = (value) => createPrefixedId(value, "aud_", "AuditRecordId");
export const createRevisionRecordId = (value) => createPrefixedId(value, "rev_", "RevisionRecordId");
export const createPublicationReadyArtifactId = (value) => createPrefixedId(value, "prad_", "PublicationReadyArtifactId");
export const createControlledStateTransitionId = (value) => createPrefixedId(value, "ctr_", "ControlledStateTransitionId");
export const createEditorialActorId = (value) => createPrefixedId(value, "actor_", "EditorialActorId");
//# sourceMappingURL=editorial-ids.vo.js.map