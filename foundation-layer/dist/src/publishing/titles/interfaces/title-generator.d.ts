import type { MarketDraftPipeline } from "../../../market-design/drafting/entities/market-draft-pipeline.entity.js";
import type { TitleSet } from "../entities/title-set.entity.js";
export interface TitleGenerator {
    generate(input: MarketDraftPipeline): TitleSet;
}
//# sourceMappingURL=title-generator.d.ts.map