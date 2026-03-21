import type { MarketDraftPipeline } from "../../../market-design/drafting/entities/market-draft-pipeline.entity.js";
import type { RulebookDraftContract } from "../contracts/rulebook-draft.contract.js";

/**
 * Compatibility adapter for legacy rulebook drafts used by upstream pipelines.
 * This keeps publishing detached from editorial/live systems while accepting
 * a stable, minimal draft contract.
 */
export type FoundationRulebookDraft = RulebookDraftContract;

export const toFoundationRulebookDraft = (
  pipeline: MarketDraftPipeline,
): FoundationRulebookDraft => {
  const sortedPriority = [...pipeline.source_hierarchy_selection.selected_source_priority].sort(
    (left, right) => left.priority_rank - right.priority_rank,
  );
  return {
    title: pipeline.foundation_candidate_market.title,
    closesAt: pipeline.deadline_resolution.market_close_time,
    resolutionSourceUrl:
      sortedPriority[0]?.source_class === undefined
        ? null
        : `source-class://${sortedPriority[0].source_class}`,
  resolutionCriteriaYes: "Yes resolves when the canonical condition is satisfied by qualified sources.",
  resolutionCriteriaNo: "No resolves when the canonical condition is not satisfied by qualified sources.",
  timezone: pipeline.deadline_resolution.timezone,
  resolutionSourceSecondary:
    sortedPriority[1] === undefined ? null : `source-class://${sortedPriority[1].source_class}`,
  resolutionSourceTertiary:
    sortedPriority[2] === undefined ? null : `source-class://${sortedPriority[2].source_class}`,
  };
};
