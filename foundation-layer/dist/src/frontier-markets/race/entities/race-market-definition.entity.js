import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { WinningConditionType } from "../../enums/winning-condition-type.enum.js";
import { RaceValidationStatus } from "../../enums/race-validation-status.enum.js";
import { createRaceTarget } from "./race-target.entity.js";
export const createRaceMarketDefinition = (input) => {
    if (!Object.values(RaceValidationStatus).includes(input.race_validation_status)) {
        throw new ValidationError("INVALID_RACE_MARKET_DEFINITION", "race_validation_status is invalid");
    }
    if (!Object.values(WinningConditionType).includes(input.winning_condition.type)) {
        throw new ValidationError("INVALID_RACE_MARKET_DEFINITION", "winning_condition.type is invalid");
    }
    if (input.race_targets.length < 2) {
        throw new ValidationError("INVALID_RACE_MARKET_DEFINITION", "race_targets must have at least 2 items");
    }
    const normalizedTargets = input.race_targets.map(createRaceTarget);
    return deepFreeze({
        ...input,
        race_targets: normalizedTargets,
        metadata: { ...input.metadata },
    });
};
//# sourceMappingURL=race-market-definition.entity.js.map