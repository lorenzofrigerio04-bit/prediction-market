import type { ControlledStateTransition } from "../entities/controlled-state-transition.entity.js";
import type { ApprovalDecision } from "../../decisions/entities/approval-decision.entity.js";
import type { RejectionDecision } from "../../decisions/entities/rejection-decision.entity.js";
import type { ManualOverride } from "../../overrides/entities/manual-override.entity.js";
import type { ReviewQueueEntry } from "../../queue/entities/review-queue-entry.entity.js";
import type { AuditRecord } from "../../audit/entities/audit-record.entity.js";
import type { PublicationReadyArtifact } from "../../readiness/entities/publication-ready-artifact.entity.js";

export type ControlledTransitionContext = Readonly<{
  queue_entry: ReviewQueueEntry;
  approvals: readonly ApprovalDecision[];
  rejections: readonly RejectionDecision[];
  manual_overrides: readonly ManualOverride[];
  audit_record: AuditRecord | null;
  publication_ready_artifact_nullable: PublicationReadyArtifact | null;
}>;

export interface ControlledStateTransitionManager {
  validateTransition(
    transition: ControlledStateTransition,
    context: ControlledTransitionContext,
  ): ControlledStateTransition;
}
