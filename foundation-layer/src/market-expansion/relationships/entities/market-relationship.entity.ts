import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { RelationshipStrength } from "../../enums/relationship-strength.enum.js";
import { RelationshipType } from "../../enums/relationship-type.enum.js";
import type { MarketRelationshipId } from "../../value-objects/market-expansion-ids.vo.js";
import {
  createExpansionNote,
  createMarketRef,
  type ExpansionNote,
  type MarketRef,
} from "../../value-objects/market-expansion-shared.vo.js";

export type MarketRelationship = Readonly<{
  id: MarketRelationshipId;
  source_market_ref: MarketRef;
  target_market_ref: MarketRef;
  relationship_type: RelationshipType;
  relationship_strength: RelationshipStrength;
  blocking_cannibalization: boolean;
  notes_nullable: ExpansionNote | null;
}>;

const BLOCKING_ALLOWED_STRENGTHS = new Set<RelationshipStrength>([
  RelationshipStrength.HIGH,
  RelationshipStrength.CRITICAL,
]);

export const createMarketRelationship = (input: MarketRelationship): MarketRelationship => {
  if (!Object.values(RelationshipType).includes(input.relationship_type)) {
    throw new ValidationError("INVALID_MARKET_RELATIONSHIP", "relationship_type is invalid");
  }
  if (!Object.values(RelationshipStrength).includes(input.relationship_strength)) {
    throw new ValidationError("INVALID_MARKET_RELATIONSHIP", "relationship_strength is invalid");
  }
  const source_market_ref = createMarketRef(input.source_market_ref);
  const target_market_ref = createMarketRef(input.target_market_ref);
  if (source_market_ref === target_market_ref) {
    throw new ValidationError(
      "INVALID_MARKET_RELATIONSHIP",
      "source_market_ref and target_market_ref must differ",
    );
  }
  if (input.blocking_cannibalization && !BLOCKING_ALLOWED_STRENGTHS.has(input.relationship_strength)) {
    throw new ValidationError(
      "INVALID_MARKET_RELATIONSHIP",
      "blocking_cannibalization=true requires relationship_strength high or critical",
    );
  }
  return deepFreeze({
    ...input,
    source_market_ref,
    target_market_ref,
    notes_nullable: input.notes_nullable === null ? null : createExpansionNote(input.notes_nullable),
  });
};
