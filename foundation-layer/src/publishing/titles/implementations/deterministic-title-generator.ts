import { createEntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { MarketDraftPipeline } from "../../../market-design/drafting/entities/market-draft-pipeline.entity.js";
import { createMarketDraftPipelineId, createTitleSetId } from "../../value-objects/publishing-ids.vo.js";
import { createDeterministicToken } from "../../value-objects/publishing-shared.vo.js";
import { TitleGenerationStatus } from "../../enums/title-generation-status.enum.js";
import { createTitleSet, type TitleSet } from "../entities/title-set.entity.js";
import type { TitleGenerator } from "../interfaces/title-generator.js";

const toPipelineId = (input: MarketDraftPipeline) =>
  createMarketDraftPipelineId(`mdp_${input.foundation_candidate_market.id.slice(4)}pl`);

const toCanonicalTitle = (input: MarketDraftPipeline): string => {
  const base = input.foundation_candidate_market.title;
  return base.endsWith("?") ? base : `${base}?`;
};

const toDisplayTitle = (canonicalTitle: string): string =>
  canonicalTitle.replace(/^will\s+/i, "").replace(/\?$/, "").trim();

const toSubtitle = (input: MarketDraftPipeline): string =>
  `Resolves using ${input.contract_selection.selected_contract_type} contract and preselected source hierarchy.`;

export class DeterministicTitleGenerator implements TitleGenerator {
  generate(input: MarketDraftPipeline): TitleSet {
    const pipelineId = toPipelineId(input);
    const canonicalTitle = toCanonicalTitle(input);
    const displayTitle = toDisplayTitle(canonicalTitle);
    const suffix = createDeterministicToken(`${pipelineId}|${canonicalTitle}`);
    return createTitleSet({
      id: createTitleSetId(`tset_${suffix}ttl`),
      version: createEntityVersion(1),
      market_draft_pipeline_id: pipelineId,
      canonical_title: canonicalTitle,
      display_title: displayTitle,
      subtitle: toSubtitle(input),
      title_generation_status: TitleGenerationStatus.GENERATED,
      generation_metadata: {
        generator: "DeterministicTitleGenerator",
        contract_type: input.contract_selection.selected_contract_type,
      },
    });
  }
}
