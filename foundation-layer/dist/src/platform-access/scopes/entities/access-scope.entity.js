import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ScopeType } from "../../enums/scope-type.enum.js";
export const createAccessScope = (input) => {
    if (!Object.values(ScopeType).includes(input.scope_type)) {
        throw new ValidationError("INVALID_ACCESS_SCOPE", "scope_type is invalid");
    }
    if ((input.scope_type === ScopeType.WORKSPACE ||
        input.scope_type === ScopeType.WORKSPACE_MODULE ||
        input.scope_type === ScopeType.WORKSPACE_ENTITY) &&
        input.workspace_id_nullable === null) {
        throw new ValidationError("INVALID_ACCESS_SCOPE", "workspace_id_nullable is required for workspace-specific scope");
    }
    if ((input.scope_type === ScopeType.MODULE || input.scope_type === ScopeType.WORKSPACE_MODULE) &&
        input.module_scope_nullable === null) {
        throw new ValidationError("INVALID_ACCESS_SCOPE", "module_scope_nullable is required for module scope types");
    }
    if ((input.scope_type === ScopeType.ENTITY || input.scope_type === ScopeType.WORKSPACE_ENTITY) &&
        input.entity_scope_nullable === null) {
        throw new ValidationError("INVALID_ACCESS_SCOPE", "entity_scope_nullable is required for entity scope types");
    }
    return deepFreeze({ ...input });
};
//# sourceMappingURL=access-scope.entity.js.map