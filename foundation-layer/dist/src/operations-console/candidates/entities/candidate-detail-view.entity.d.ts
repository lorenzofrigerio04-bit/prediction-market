import { ActionKey } from "../../enums/action-key.enum.js";
import { VisibilityStatus } from "../../enums/visibility-status.enum.js";
import type { AuditRef } from "../../value-objects/audit-ref.vo.js";
import type { CandidateRef } from "../../value-objects/candidate-ref.vo.js";
import type { CandidateDetailViewId } from "../../value-objects/operations-console-ids.vo.js";
import type { PublicationRef } from "../../value-objects/publication-ref.vo.js";
import type { ReviewRef } from "../../value-objects/review-ref.vo.js";
import type { CandidateArtifactSection } from "./candidate-artifact-section.entity.js";
import type { CandidateReadinessSnapshot } from "./candidate-readiness-snapshot.entity.js";
export type CandidateDetailView = Readonly<{
    id: CandidateDetailViewId;
    version: string;
    candidate_ref: CandidateRef;
    artifact_sections: readonly CandidateArtifactSection[];
    readiness_snapshot: CandidateReadinessSnapshot;
    linked_audit_refs: readonly AuditRef[];
    linked_review_refs: readonly ReviewRef[];
    linked_publication_refs: readonly PublicationRef[];
    visible_actions: readonly ActionKey[];
    visibility_status: VisibilityStatus;
}>;
export declare const createCandidateDetailView: (input: CandidateDetailView) => CandidateDetailView;
//# sourceMappingURL=candidate-detail-view.entity.d.ts.map