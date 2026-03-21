import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type ReviewQueueEntryId = Branded<string, "ReviewQueueEntryId">;
export type EditorialReviewId = Branded<string, "EditorialReviewId">;
export type ApprovalDecisionId = Branded<string, "ApprovalDecisionId">;
export type RejectionDecisionId = Branded<string, "RejectionDecisionId">;
export type ManualOverrideId = Branded<string, "ManualOverrideId">;
export type AuditRecordId = Branded<string, "AuditRecordId">;
export type RevisionRecordId = Branded<string, "RevisionRecordId">;
export type PublicationReadyArtifactId = Branded<string, "PublicationReadyArtifactId">;
export type ControlledStateTransitionId = Branded<string, "ControlledStateTransitionId">;
export type EditorialActorId = Branded<string, "EditorialActorId">;

export const createReviewQueueEntryId = (value: string): ReviewQueueEntryId =>
  createPrefixedId(value, "rqe_", "ReviewQueueEntryId") as ReviewQueueEntryId;
export const createEditorialReviewId = (value: string): EditorialReviewId =>
  createPrefixedId(value, "edrev_", "EditorialReviewId") as EditorialReviewId;
export const createApprovalDecisionId = (value: string): ApprovalDecisionId =>
  createPrefixedId(value, "apd_", "ApprovalDecisionId") as ApprovalDecisionId;
export const createRejectionDecisionId = (value: string): RejectionDecisionId =>
  createPrefixedId(value, "rjd_", "RejectionDecisionId") as RejectionDecisionId;
export const createManualOverrideId = (value: string): ManualOverrideId =>
  createPrefixedId(value, "ovr_", "ManualOverrideId") as ManualOverrideId;
export const createAuditRecordId = (value: string): AuditRecordId =>
  createPrefixedId(value, "aud_", "AuditRecordId") as AuditRecordId;
export const createRevisionRecordId = (value: string): RevisionRecordId =>
  createPrefixedId(value, "rev_", "RevisionRecordId") as RevisionRecordId;
export const createPublicationReadyArtifactId = (value: string): PublicationReadyArtifactId =>
  createPrefixedId(value, "prad_", "PublicationReadyArtifactId") as PublicationReadyArtifactId;
export const createControlledStateTransitionId = (value: string): ControlledStateTransitionId =>
  createPrefixedId(value, "ctr_", "ControlledStateTransitionId") as ControlledStateTransitionId;
export const createEditorialActorId = (value: string): EditorialActorId =>
  createPrefixedId(value, "actor_", "EditorialActorId") as EditorialActorId;
