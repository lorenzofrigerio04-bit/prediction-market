import type { MarketDraftPipeline } from "../../../market-design/drafting/entities/market-draft-pipeline.entity.js";
import type { RulebookDraftContract } from "../contracts/rulebook-draft.contract.js";
/**
 * Compatibility adapter for legacy rulebook drafts used by upstream pipelines.
 * This keeps publishing detached from editorial/live systems while accepting
 * a stable, minimal draft contract.
 */
export type FoundationRulebookDraft = RulebookDraftContract;
export declare const toFoundationRulebookDraft: (pipeline: MarketDraftPipeline) => FoundationRulebookDraft;
//# sourceMappingURL=foundation-rulebook-draft.adapter.d.ts.map