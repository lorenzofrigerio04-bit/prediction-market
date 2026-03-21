import type { ActionKey } from "../../enums/action-key.enum.js";
import type { TargetModule } from "../../enums/target-module.enum.js";
import type { AuthorizationDecision } from "../entities/authorization-decision.entity.js";
import type { UserIdentityId, WorkspaceId } from "../../value-objects/platform-access-ids.vo.js";
import type { AccessScope } from "../../scopes/entities/access-scope.entity.js";

export type AuthorizationRequest = Readonly<{
  user_id: UserIdentityId;
  target_module: TargetModule;
  action_key: ActionKey;
  workspace_id_nullable: WorkspaceId | null;
  evaluated_scope?: AccessScope;
}>;

export interface AuthorizationEngine {
  authorize(request: AuthorizationRequest): AuthorizationDecision;
}
