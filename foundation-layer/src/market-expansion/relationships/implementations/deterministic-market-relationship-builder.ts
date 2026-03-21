import { createDeterministicToken } from "../../../publishing/value-objects/publishing-shared.vo.js";
import { RelationshipStrength } from "../../enums/relationship-strength.enum.js";
import { RelationshipType } from "../../enums/relationship-type.enum.js";
import { createMarketRelationship } from "../entities/market-relationship.entity.js";
import type {
  MarketRelationshipBuilder,
  MarketRelationshipBuilderInput,
} from "../interfaces/market-relationship-builder.js";
import { createMarketRelationshipId } from "../../value-objects/market-expansion-ids.vo.js";

export class DeterministicMarketRelationshipBuilder implements MarketRelationshipBuilder {
  build(input: MarketRelationshipBuilderInput) {
    const relationships = [
      ...input.satellites.map((satellite) => ({
        source_market_ref: input.flagship.selected_market_ref,
        target_market_ref: satellite.market_ref,
        relationship_type: RelationshipType.COMPLEMENTS,
        relationship_strength: RelationshipStrength.MEDIUM,
        blocking_cannibalization: false,
        notes_nullable: "satellite complements flagship scope",
      })),
      ...input.derivatives.map((derivative) => ({
        source_market_ref: input.flagship.selected_market_ref,
        target_market_ref: derivative.market_ref,
        relationship_type: RelationshipType.BLOCKS,
        relationship_strength: derivative.dependency_strength >= 0.85
          ? RelationshipStrength.CRITICAL
          : RelationshipStrength.HIGH,
        blocking_cannibalization: true,
        notes_nullable: "derivative can block overlapping liquidity with flagship",
      })),
    ];
    return relationships.map((relation, index) => {
      const token = createDeterministicToken(
        `${relation.source_market_ref}|${relation.target_market_ref}|${index}`,
      );
      return createMarketRelationship({
        id: createMarketRelationshipId(`mrl_${token}rel`),
        ...relation,
      });
    });
  }
}
