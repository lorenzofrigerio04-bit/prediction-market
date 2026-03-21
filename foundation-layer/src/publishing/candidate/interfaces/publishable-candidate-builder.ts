import type { MarketDraftPipeline } from "../../../market-design/drafting/entities/market-draft-pipeline.entity.js";
import type { RulebookCompilation } from "../../rulebook/entities/rulebook-compilation.entity.js";
import type { ResolutionSummary } from "../../summaries/entities/resolution-summary.entity.js";
import type { TitleSet } from "../../titles/entities/title-set.entity.js";
import type { PublishableCandidate } from "../entities/publishable-candidate.entity.js";

export interface PublishableCandidateBuilderInput {
  pipeline: MarketDraftPipeline;
  title_set: TitleSet;
  resolution_summary: ResolutionSummary;
  rulebook_compilation: RulebookCompilation;
}

export interface PublishableCandidateBuilder {
  build(input: PublishableCandidateBuilderInput): PublishableCandidate;
}
