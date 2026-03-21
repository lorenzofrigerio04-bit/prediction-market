import { RelationshipStrength } from "../../enums/relationship-strength.enum.js";
import { RelationshipType } from "../../enums/relationship-type.enum.js";
import type { MarketRelationshipId } from "../../value-objects/market-expansion-ids.vo.js";
import { type ExpansionNote, type MarketRef } from "../../value-objects/market-expansion-shared.vo.js";
export type MarketRelationship = Readonly<{
    id: MarketRelationshipId;
    source_market_ref: MarketRef;
    target_market_ref: MarketRef;
    relationship_type: RelationshipType;
    relationship_strength: RelationshipStrength;
    blocking_cannibalization: boolean;
    notes_nullable: ExpansionNote | null;
}>;
export declare const createMarketRelationship: (input: MarketRelationship) => MarketRelationship;
//# sourceMappingURL=market-relationship.entity.d.ts.map