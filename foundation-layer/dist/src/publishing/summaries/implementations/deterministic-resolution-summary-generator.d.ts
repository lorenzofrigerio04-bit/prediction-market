import type { MarketDraftPipeline } from "../../../market-design/drafting/entities/market-draft-pipeline.entity.js";
import { type ResolutionSummary } from "../entities/resolution-summary.entity.js";
import type { ResolutionSummaryGenerator } from "../interfaces/resolution-summary-generator.js";
export declare class DeterministicResolutionSummaryGenerator implements ResolutionSummaryGenerator {
    generate(input: MarketDraftPipeline): ResolutionSummary;
}
//# sourceMappingURL=deterministic-resolution-summary-generator.d.ts.map