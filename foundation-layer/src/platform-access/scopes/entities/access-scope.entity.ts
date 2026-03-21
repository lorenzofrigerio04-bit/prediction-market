import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ScopeType } from "../../enums/scope-type.enum.js";
import type { WorkspaceId } from "../../value-objects/platform-access-ids.vo.js";
import type { EntityScope } from "../../value-objects/entity-scope.vo.js";
import type { TargetModule } from "../../enums/target-module.enum.js";

export type AccessScope = Readonly<{
  scope_type: ScopeType;
  workspace_id_nullable: WorkspaceId | null;
  module_scope_nullable: TargetModule | null;
  entity_scope_nullable: EntityScope | null;
  notes_nullable: string | null;
}>;

export const createAccessScope = (input: AccessScope): AccessScope => {
  if (!Object.values(ScopeType).includes(input.scope_type)) {
    throw new ValidationError("INVALID_ACCESS_SCOPE", "scope_type is invalid");
  }
  if (
    (input.scope_type === ScopeType.WORKSPACE ||
      input.scope_type === ScopeType.WORKSPACE_MODULE ||
      input.scope_type === ScopeType.WORKSPACE_ENTITY) &&
    input.workspace_id_nullable === null
  ) {
    throw new ValidationError(
      "INVALID_ACCESS_SCOPE",
      "workspace_id_nullable is required for workspace-specific scope",
    );
  }
  if (
    (input.scope_type === ScopeType.MODULE || input.scope_type === ScopeType.WORKSPACE_MODULE) &&
    input.module_scope_nullable === null
  ) {
    throw new ValidationError("INVALID_ACCESS_SCOPE", "module_scope_nullable is required for module scope types");
  }
  if (
    (input.scope_type === ScopeType.ENTITY || input.scope_type === ScopeType.WORKSPACE_ENTITY) &&
    input.entity_scope_nullable === null
  ) {
    throw new ValidationError("INVALID_ACCESS_SCOPE", "entity_scope_nullable is required for entity scope types");
  }
  return deepFreeze({ ...input });
};
