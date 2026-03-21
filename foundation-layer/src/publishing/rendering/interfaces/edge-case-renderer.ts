import type { MarketDraftPipeline } from "../../../market-design/drafting/entities/market-draft-pipeline.entity.js";
import type { EdgeCaseRender } from "../entities/edge-case-render.entity.js";

export interface EdgeCaseRenderer {
  render(input: MarketDraftPipeline): EdgeCaseRender;
}
