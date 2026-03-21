import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { SatelliteRole } from "../../enums/satellite-role.enum.js";
import { createMarketRef, createExpansionNote, } from "../../value-objects/market-expansion-shared.vo.js";
export const createSatelliteMarketDefinition = (input) => {
    if (!Object.values(SatelliteRole).includes(input.satellite_role)) {
        throw new ValidationError("INVALID_SATELLITE_MARKET_DEFINITION", "satellite_role is invalid");
    }
    const parent_market_ref = createMarketRef(input.parent_market_ref);
    const market_ref = createMarketRef(input.market_ref);
    if (parent_market_ref === market_ref) {
        throw new ValidationError("INVALID_SATELLITE_MARKET_DEFINITION", "satellite market_ref cannot be equal to parent_market_ref");
    }
    return deepFreeze({
        ...input,
        parent_market_ref,
        market_ref,
        dependency_notes_nullable: input.dependency_notes_nullable === null ? null : createExpansionNote(input.dependency_notes_nullable),
    });
};
//# sourceMappingURL=satellite-market-definition.entity.js.map