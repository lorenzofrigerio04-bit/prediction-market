import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ActionKey } from "../../enums/action-key.enum.js";
import { ScopeType } from "../../enums/scope-type.enum.js";
import { TargetModule } from "../../enums/target-module.enum.js";
export const createPlatformActionCompatibility = (input) => {
    if (!Object.values(TargetModule).includes(input.target_module)) {
        throw new ValidationError("INVALID_PLATFORM_ACTION_COMPATIBILITY", "target_module is invalid");
    }
    if (!Object.values(ActionKey).includes(input.action_key)) {
        throw new ValidationError("INVALID_PLATFORM_ACTION_COMPATIBILITY", "action_key is invalid");
    }
    if (!Object.values(ScopeType).includes(input.required_scope_type)) {
        throw new ValidationError("INVALID_PLATFORM_ACTION_COMPATIBILITY", "required_scope_type is invalid");
    }
    return deepFreeze({
        ...input,
        required_capabilities_nullable: input.required_capabilities_nullable === null
            ? null
            : deepFreeze([...input.required_capabilities_nullable]),
    });
};
//# sourceMappingURL=platform-action-compatibility.entity.js.map