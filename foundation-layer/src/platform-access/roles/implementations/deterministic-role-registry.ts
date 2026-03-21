import type { RoleDefinition } from "../entities/role-definition.entity.js";
import type { RoleRegistry } from "../interfaces/role-registry.js";
import type { RoleDefinitionId } from "../../value-objects/platform-access-ids.vo.js";

export class DeterministicRoleRegistry implements RoleRegistry {
  private readonly byId: ReadonlyMap<RoleDefinitionId, RoleDefinition>;

  constructor(roles: readonly RoleDefinition[]) {
    this.byId = new Map(roles.map((role) => [role.id, role]));
  }

  getById(roleId: RoleDefinitionId): RoleDefinition | null {
    return this.byId.get(roleId) ?? null;
  }
}
