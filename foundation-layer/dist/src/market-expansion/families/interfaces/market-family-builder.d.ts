import type { MarketFamily } from "../entities/market-family.entity.js";
import type { ExpansionStrategy } from "../../strategies/entities/expansion-strategy.entity.js";
import type { FlagshipMarketSelection } from "../../flagship/entities/flagship-market-selection.entity.js";
import type { SatelliteMarketDefinition } from "../../satellites/entities/satellite-market-definition.entity.js";
import type { DerivativeMarketDefinition } from "../../derivatives/entities/derivative-market-definition.entity.js";
export type MarketFamilyBuilderInput = Readonly<{
    strategy: ExpansionStrategy;
    flagship: FlagshipMarketSelection;
    satellites: readonly SatelliteMarketDefinition[];
    derivatives: readonly DerivativeMarketDefinition[];
}>;
export interface MarketFamilyBuilder {
    build(input: MarketFamilyBuilderInput): MarketFamily;
}
//# sourceMappingURL=market-family-builder.d.ts.map