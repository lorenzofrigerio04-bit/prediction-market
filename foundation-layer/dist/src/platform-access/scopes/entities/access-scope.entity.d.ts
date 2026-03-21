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
export declare const createAccessScope: (input: AccessScope) => AccessScope;
//# sourceMappingURL=access-scope.entity.d.ts.map