import { RelationshipStrength } from "../../enums/relationship-strength.enum.js";
import { RelationshipType } from "../../enums/relationship-type.enum.js";
import type { MarketRelationshipBuilder, MarketRelationshipBuilderInput } from "../interfaces/market-relationship-builder.js";
export declare class DeterministicMarketRelationshipBuilder implements MarketRelationshipBuilder {
    build(input: MarketRelationshipBuilderInput): Readonly<{
        id: import("../../index.js").MarketRelationshipId;
        source_market_ref: import("../../index.js").MarketRef;
        target_market_ref: import("../../index.js").MarketRef;
        relationship_type: RelationshipType;
        relationship_strength: RelationshipStrength;
        blocking_cannibalization: boolean;
        notes_nullable: import("../../index.js").ExpansionNote | null;
    }>[];
}
//# sourceMappingURL=deterministic-market-relationship-builder.d.ts.map