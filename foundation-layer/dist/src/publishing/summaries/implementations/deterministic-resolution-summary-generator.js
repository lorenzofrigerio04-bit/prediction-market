import { createConfidenceScore } from "../../../value-objects/confidence-score.vo.js";
import { createEntityVersion } from "../../../value-objects/entity-version.vo.js";
import { createMarketDraftPipelineId, createResolutionSummaryId, } from "../../value-objects/publishing-ids.vo.js";
import { createDeterministicToken } from "../../value-objects/publishing-shared.vo.js";
import { createResolutionSummary, } from "../entities/resolution-summary.entity.js";
const toPipelineId = (input) => createMarketDraftPipelineId(`mdp_${input.foundation_candidate_market.id.slice(4)}pl`);
export class DeterministicResolutionSummaryGenerator {
    generate(input) {
        const pipelineId = toPipelineId(input);
        const sourceTop = input.source_hierarchy_selection.selected_source_priority[0]?.source_class ?? "unknown";
        const summary = `Resolves Yes if criteria are met by deadline using ${sourceTop} as primary source class.`;
        const token = createDeterministicToken(`${pipelineId}|${summary}`);
        return createResolutionSummary({
            id: createResolutionSummaryId(`rsum_${token}sum`),
            version: createEntityVersion(1),
            market_draft_pipeline_id: pipelineId,
            one_line_resolution_summary: summary,
            summary_basis: {
                resolution_rule_ref: `contract:${input.contract_selection.selected_contract_type}`,
                source_hierarchy_ref: input.source_hierarchy_selection.id,
                deadline_ref: input.deadline_resolution.id,
                basis_points: [
                    input.deadline_resolution.deadline_basis_reference,
                    input.source_hierarchy_selection.source_selection_reason,
                ],
            },
            summary_confidence: createConfidenceScore(Math.min(input.contract_selection.selection_confidence, input.deadline_resolution.confidence)),
        });
    }
}
//# sourceMappingURL=deterministic-resolution-summary-generator.js.map