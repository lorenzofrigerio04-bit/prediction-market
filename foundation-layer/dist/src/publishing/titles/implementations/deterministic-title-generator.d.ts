import type { MarketDraftPipeline } from "../../../market-design/drafting/entities/market-draft-pipeline.entity.js";
import { type TitleSet } from "../entities/title-set.entity.js";
import type { TitleGenerator } from "../interfaces/title-generator.js";
export declare class DeterministicTitleGenerator implements TitleGenerator {
    generate(input: MarketDraftPipeline): TitleSet;
}
//# sourceMappingURL=deterministic-title-generator.d.ts.map