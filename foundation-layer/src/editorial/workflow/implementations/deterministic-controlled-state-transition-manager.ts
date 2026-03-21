import { FinalReadinessStatus } from "../../enums/final-readiness-status.enum.js";
import {
  createControlledStateTransition,
  type ControlledStateTransition,
} from "../entities/controlled-state-transition.entity.js";
import type {
  ControlledStateTransitionManager,
  ControlledTransitionContext,
} from "../interfaces/controlled-state-transition-manager.js";

export class DeterministicControlledStateTransitionManager
  implements ControlledStateTransitionManager
{
  validateTransition(
    transition: ControlledStateTransition,
    context: ControlledTransitionContext,
  ): ControlledStateTransition {
    if (context.audit_record === null) {
      throw new Error("CONTROLLED_TRANSITION_REQUIRES_AUDIT_RECORD");
    }
    if (context.audit_record.id !== transition.audit_record_id) {
      throw new Error("CONTROLLED_TRANSITION_AUDIT_REFERENCE_MISMATCH");
    }
    if (context.queue_entry.publishable_candidate_id !== transition.publishable_candidate_id) {
      throw new Error("CONTROLLED_TRANSITION_CANDIDATE_MISMATCH");
    }
    if (
      context.publication_ready_artifact_nullable?.final_readiness_status ===
        FinalReadinessStatus.APPROVED &&
      context.approvals.length === 0
    ) {
      throw new Error("CONTROLLED_TRANSITION_APPROVAL_REQUIRED");
    }
    if (
      context.publication_ready_artifact_nullable?.final_readiness_status ===
        FinalReadinessStatus.APPROVED &&
      context.rejections.length > 0
    ) {
      throw new Error("CONTROLLED_TRANSITION_REJECTION_CONFLICT");
    }
    if (
      context.publication_ready_artifact_nullable?.final_readiness_status ===
        FinalReadinessStatus.APPROVED &&
      context.queue_entry.blocking_flags.some((item) => !item.is_resolved)
    ) {
      throw new Error("CONTROLLED_TRANSITION_BLOCKING_FLAGS_UNRESOLVED");
    }
    return createControlledStateTransition(transition);
  }
}
