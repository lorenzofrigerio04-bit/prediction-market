import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import type { PublishableCandidateId } from "../../../publishing/value-objects/publishing-ids.vo.js";
import { FinalReadinessStatus } from "../../enums/final-readiness-status.enum.js";
import type {
  PublicationReadyArtifactId,
  EditorialActorId,
  ApprovalDecisionId,
} from "../../value-objects/editorial-ids.vo.js";
import type { GatingSummary } from "../../value-objects/gating-summary.vo.js";
import { createGatingSummary } from "../../value-objects/gating-summary.vo.js";

export type PublicationReadyArtifact = Readonly<{
  id: PublicationReadyArtifactId;
  version: EntityVersion;
  publishable_candidate_id: PublishableCandidateId;
  final_readiness_status: FinalReadinessStatus;
  approved_artifacts: readonly ApprovalDecisionId[];
  gating_summary: GatingSummary;
  generated_at: Timestamp;
  generated_by: EditorialActorId;
  handoff_notes_nullable: string | null;
}>;

export const createPublicationReadyArtifact = (
  input: PublicationReadyArtifact,
): PublicationReadyArtifact => {
  if (!Object.values(FinalReadinessStatus).includes(input.final_readiness_status)) {
    throw new ValidationError("INVALID_PUBLICATION_READY_ARTIFACT", "final_readiness_status is invalid");
  }
  if (
    input.final_readiness_status === FinalReadinessStatus.APPROVED &&
    input.approved_artifacts.length === 0
  ) {
    throw new ValidationError(
      "INVALID_PUBLICATION_READY_ARTIFACT",
      "approved artifacts are required for approved readiness status",
    );
  }
  return deepFreeze({
    ...input,
    approved_artifacts: deepFreeze([...input.approved_artifacts]),
    gating_summary: createGatingSummary(input.gating_summary),
  });
};
