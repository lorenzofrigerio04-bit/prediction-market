import { deepFreeze } from "../../common/utils/deep-freeze.js";
import { MeasurementWindowUnit } from "../enums/measurement-window-unit.enum.js";
import { ValidationError } from "../../common/errors/validation-error.js";
export const createWindowDefinition = (value) => {
    if (!Object.values(MeasurementWindowUnit).includes(value.unit)) {
        throw new ValidationError("INVALID_WINDOW_UNIT", "window_definition.unit is invalid", { unit: value.unit });
    }
    if (!Number.isInteger(value.size) || value.size <= 0) {
        throw new ValidationError("INVALID_WINDOW_SIZE", "window_definition.size must be a positive integer", { size: value.size });
    }
    if (value.unit === MeasurementWindowUnit.LIFETIME && value.size !== 1) {
        throw new ValidationError("INVALID_LIFETIME_WINDOW_SIZE", "window_definition.size must be 1 for lifetime windows", { size: value.size });
    }
    return deepFreeze({ ...value });
};
//# sourceMappingURL=window-definition.vo.js.map