import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { PublishableCandidateStatus } from "../../enums/publishable-candidate-status.enum.js";
import type { MarketDraftPipelineId, PublishableCandidateId, ResolutionSummaryId, RulebookCompilationId, TitleSetId } from "../../value-objects/publishing-ids.vo.js";
import { type DeterministicMetadata, type PublishingIssue } from "../../value-objects/publishing-shared.vo.js";
export type PublishableCandidate = Readonly<{
    id: PublishableCandidateId;
    version: EntityVersion;
    market_draft_pipeline_id: MarketDraftPipelineId;
    title_set_id: TitleSetId;
    resolution_summary_id: ResolutionSummaryId;
    rulebook_compilation_id: RulebookCompilationId;
    candidate_status: PublishableCandidateStatus;
    structural_readiness_score: number;
    blocking_issues: readonly PublishingIssue[];
    warnings: readonly PublishingIssue[];
    compatibility_metadata: DeterministicMetadata;
}>;
export declare const createPublishableCandidate: (input: PublishableCandidate) => PublishableCandidate;
//# sourceMappingURL=publishable-candidate.entity.d.ts.map