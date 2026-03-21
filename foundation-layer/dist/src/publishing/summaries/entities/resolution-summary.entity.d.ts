import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { ConfidenceScore } from "../../../value-objects/confidence-score.vo.js";
import type { MarketDraftPipelineId, ResolutionSummaryId } from "../../value-objects/publishing-ids.vo.js";
export type SummaryBasis = Readonly<{
    resolution_rule_ref: string;
    source_hierarchy_ref: string;
    deadline_ref: string;
    basis_points: readonly string[];
}>;
export type ResolutionSummary = Readonly<{
    id: ResolutionSummaryId;
    version: EntityVersion;
    market_draft_pipeline_id: MarketDraftPipelineId;
    one_line_resolution_summary: string;
    summary_basis: SummaryBasis;
    summary_confidence: ConfidenceScore;
}>;
export declare const createResolutionSummary: (input: ResolutionSummary) => ResolutionSummary;
//# sourceMappingURL=resolution-summary.entity.d.ts.map