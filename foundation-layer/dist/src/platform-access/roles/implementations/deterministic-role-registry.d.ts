import type { RoleDefinition } from "../entities/role-definition.entity.js";
import type { RoleRegistry } from "../interfaces/role-registry.js";
import type { RoleDefinitionId } from "../../value-objects/platform-access-ids.vo.js";
export declare class DeterministicRoleRegistry implements RoleRegistry {
    private readonly byId;
    constructor(roles: readonly RoleDefinition[]);
    getById(roleId: RoleDefinitionId): RoleDefinition | null;
}
//# sourceMappingURL=deterministic-role-registry.d.ts.map