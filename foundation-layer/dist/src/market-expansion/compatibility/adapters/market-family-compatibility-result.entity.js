import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { FamilyCompatibilityStatus } from "../../enums/family-compatibility-status.enum.js";
import { createExpansionNote } from "../../value-objects/market-expansion-shared.vo.js";
export const createMarketFamilyCompatibilityResult = (input) => {
    if (!Object.values(FamilyCompatibilityStatus).includes(input.status)) {
        throw new ValidationError("INVALID_MARKET_FAMILY_COMPATIBILITY_RESULT", "status is invalid");
    }
    return deepFreeze({
        ...input,
        mapped_artifact: deepFreeze({ ...input.mapped_artifact }),
        notes: input.notes.map(createExpansionNote),
    });
};
//# sourceMappingURL=market-family-compatibility-result.entity.js.map