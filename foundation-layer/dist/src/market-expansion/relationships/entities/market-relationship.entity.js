import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { RelationshipStrength } from "../../enums/relationship-strength.enum.js";
import { RelationshipType } from "../../enums/relationship-type.enum.js";
import { createExpansionNote, createMarketRef, } from "../../value-objects/market-expansion-shared.vo.js";
const BLOCKING_ALLOWED_STRENGTHS = new Set([
    RelationshipStrength.HIGH,
    RelationshipStrength.CRITICAL,
]);
export const createMarketRelationship = (input) => {
    if (!Object.values(RelationshipType).includes(input.relationship_type)) {
        throw new ValidationError("INVALID_MARKET_RELATIONSHIP", "relationship_type is invalid");
    }
    if (!Object.values(RelationshipStrength).includes(input.relationship_strength)) {
        throw new ValidationError("INVALID_MARKET_RELATIONSHIP", "relationship_strength is invalid");
    }
    const source_market_ref = createMarketRef(input.source_market_ref);
    const target_market_ref = createMarketRef(input.target_market_ref);
    if (source_market_ref === target_market_ref) {
        throw new ValidationError("INVALID_MARKET_RELATIONSHIP", "source_market_ref and target_market_ref must differ");
    }
    if (input.blocking_cannibalization && !BLOCKING_ALLOWED_STRENGTHS.has(input.relationship_strength)) {
        throw new ValidationError("INVALID_MARKET_RELATIONSHIP", "blocking_cannibalization=true requires relationship_strength high or critical");
    }
    return deepFreeze({
        ...input,
        source_market_ref,
        target_market_ref,
        notes_nullable: input.notes_nullable === null ? null : createExpansionNote(input.notes_nullable),
    });
};
//# sourceMappingURL=market-relationship.entity.js.map