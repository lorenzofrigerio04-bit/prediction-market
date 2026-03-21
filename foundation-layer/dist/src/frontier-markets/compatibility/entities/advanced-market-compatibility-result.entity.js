import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { AdvancedCompatibilityStatus } from "../../enums/advanced-compatibility-status.enum.js";
import { createCompatibilityNote } from "../../value-objects/frontier-text.vo.js";
export const createAdvancedMarketCompatibilityResult = (input) => {
    if (!Object.values(AdvancedCompatibilityStatus).includes(input.status)) {
        throw new ValidationError("INVALID_ADVANCED_COMPATIBILITY_RESULT", "status is invalid");
    }
    return deepFreeze({
        ...input,
        mapped_artifact: { ...input.mapped_artifact },
        notes: input.notes.map(createCompatibilityNote),
    });
};
//# sourceMappingURL=advanced-market-compatibility-result.entity.js.map