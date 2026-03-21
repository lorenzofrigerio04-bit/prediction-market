import type { RoleDefinition } from "../entities/role-definition.entity.js";
import type { RoleDefinitionId } from "../../value-objects/platform-access-ids.vo.js";
export interface RoleRegistry {
    getById(roleId: RoleDefinitionId): RoleDefinition | null;
}
//# sourceMappingURL=role-registry.d.ts.map