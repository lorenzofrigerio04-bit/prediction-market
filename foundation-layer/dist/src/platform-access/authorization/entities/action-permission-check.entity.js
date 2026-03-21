import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ActionKey } from "../../enums/action-key.enum.js";
import { CheckStatus } from "../../enums/check-status.enum.js";
import { TargetModule } from "../../enums/target-module.enum.js";
export const createActionPermissionCheck = (input) => {
    if (!Object.values(ActionKey).includes(input.action_key)) {
        throw new ValidationError("INVALID_ACTION_PERMISSION_CHECK", "action_key is invalid");
    }
    if (!Object.values(TargetModule).includes(input.target_module)) {
        throw new ValidationError("INVALID_ACTION_PERMISSION_CHECK", "target_module is invalid");
    }
    if (!Object.values(CheckStatus).includes(input.check_status)) {
        throw new ValidationError("INVALID_ACTION_PERMISSION_CHECK", "check_status is invalid");
    }
    return deepFreeze({ ...input });
};
//# sourceMappingURL=action-permission-check.entity.js.map