import { createDeterministicToken } from "../../../publishing/value-objects/publishing-shared.vo.js";
import { createEntityVersion } from "../../../value-objects/entity-version.vo.js";
import { FamilyStatus } from "../../enums/family-status.enum.js";
import { SourceContextType } from "../../enums/source-context-type.enum.js";
import { createMarketFamily } from "../entities/market-family.entity.js";
import type { MarketFamilyBuilder, MarketFamilyBuilderInput } from "../interfaces/market-family-builder.js";
import { createMarketFamilyId } from "../../value-objects/market-expansion-ids.vo.js";
import { createFamilyKey } from "../../value-objects/market-expansion-shared.vo.js";

export class DeterministicMarketFamilyBuilder implements MarketFamilyBuilder {
  build(input: MarketFamilyBuilderInput) {
    const seed = [
      input.strategy.source_context_ref,
      input.flagship.selected_market_ref,
      ...input.satellites.map((item) => item.market_ref),
      ...input.derivatives.map((item) => item.market_ref),
    ].join("|");
    const token = createDeterministicToken(seed);
    return createMarketFamily({
      id: createMarketFamilyId(`mfy_${token}fam`),
      version: createEntityVersion(1),
      family_key: createFamilyKey(`family-${token}`),
      source_context_type: SourceContextType.CANONICAL_EVENT,
      source_context_ref: input.strategy.source_context_ref,
      flagship_market_ref: input.flagship.selected_market_ref,
      satellite_market_refs: input.satellites.map((item) => item.market_ref),
      derivative_market_refs: input.derivatives.map((item) => item.market_ref),
      family_status: FamilyStatus.DRAFT,
      family_metadata: {
        context_hash: token,
        generation_mode: "deterministic-v1",
        tags: ["market-expansion-v1"],
        notes: ["family built deterministically from strategy and flagship context"],
      },
    });
  }
}
