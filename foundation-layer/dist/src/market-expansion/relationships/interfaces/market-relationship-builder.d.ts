import type { FlagshipMarketSelection } from "../../flagship/entities/flagship-market-selection.entity.js";
import type { SatelliteMarketDefinition } from "../../satellites/entities/satellite-market-definition.entity.js";
import type { DerivativeMarketDefinition } from "../../derivatives/entities/derivative-market-definition.entity.js";
import type { MarketRelationship } from "../entities/market-relationship.entity.js";
export type MarketRelationshipBuilderInput = Readonly<{
    flagship: FlagshipMarketSelection;
    satellites: readonly SatelliteMarketDefinition[];
    derivatives: readonly DerivativeMarketDefinition[];
}>;
export interface MarketRelationshipBuilder {
    build(input: MarketRelationshipBuilderInput): readonly MarketRelationship[];
}
//# sourceMappingURL=market-relationship-builder.d.ts.map