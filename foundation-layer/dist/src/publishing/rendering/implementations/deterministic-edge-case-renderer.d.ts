import type { MarketDraftPipeline } from "../../../market-design/drafting/entities/market-draft-pipeline.entity.js";
import { type EdgeCaseRender } from "../entities/edge-case-render.entity.js";
import type { EdgeCaseRenderer } from "../interfaces/edge-case-renderer.js";
export declare class DeterministicEdgeCaseRenderer implements EdgeCaseRenderer {
    render(input: MarketDraftPipeline): EdgeCaseRender;
}
//# sourceMappingURL=deterministic-edge-case-renderer.d.ts.map