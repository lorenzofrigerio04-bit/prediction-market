import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import type { PublishableCandidateId } from "../../../publishing/value-objects/publishing-ids.vo.js";
import { FinalReadinessStatus } from "../../enums/final-readiness-status.enum.js";
import type { PublicationReadyArtifactId, EditorialActorId, ApprovalDecisionId } from "../../value-objects/editorial-ids.vo.js";
import type { GatingSummary } from "../../value-objects/gating-summary.vo.js";
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
export declare const createPublicationReadyArtifact: (input: PublicationReadyArtifact) => PublicationReadyArtifact;
//# sourceMappingURL=publication-ready-artifact.entity.d.ts.map