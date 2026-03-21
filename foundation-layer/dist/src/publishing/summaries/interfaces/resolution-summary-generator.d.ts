import type { MarketDraftPipeline } from "../../../market-design/drafting/entities/market-draft-pipeline.entity.js";
import type { ResolutionSummary } from "../entities/resolution-summary.entity.js";
export interface ResolutionSummaryGenerator {
    generate(input: MarketDraftPipeline): ResolutionSummary;
}
//# sourceMappingURL=resolution-summary-generator.d.ts.map