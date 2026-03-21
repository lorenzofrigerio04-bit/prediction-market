import { FinalReadinessStatus } from "../../enums/final-readiness-status.enum.js";
import {
  createPublicationReadyArtifact,
  type PublicationReadyArtifact,
} from "../entities/publication-ready-artifact.entity.js";
import type {
  PublicationReadinessEvaluator,
  ReadinessEvaluationInput,
} from "../interfaces/publication-readiness-evaluator.js";

export class DeterministicPublicationReadinessEvaluator
  implements PublicationReadinessEvaluator
{
  evaluate(input: ReadinessEvaluationInput): PublicationReadyArtifact {
    const unresolvedBlocking = input.queue_entry.blocking_flags.filter((item) => !item.is_resolved);
    const hasApproval = input.approvals.length > 0;
    const hasTerminalRejection = input.rejections.length > 0;
    const isApprovedState = input.artifact.final_readiness_status === FinalReadinessStatus.APPROVED;

    if (isApprovedState && !hasApproval) {
      throw new Error("READINESS_REQUIRES_APPROVAL");
    }
    if (isApprovedState && hasTerminalRejection) {
      throw new Error("READINESS_INCOMPATIBLE_WITH_REJECTION");
    }
    if (unresolvedBlocking.length > 0 && isApprovedState) {
      throw new Error("READINESS_BLOCKED_BY_UNRESOLVED_FLAGS");
    }
    return createPublicationReadyArtifact(input.artifact);
  }
}
