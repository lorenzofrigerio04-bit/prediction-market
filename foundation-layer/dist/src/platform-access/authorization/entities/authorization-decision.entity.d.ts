import { ActionKey } from "../../enums/action-key.enum.js";
import { DecisionStatus } from "../../enums/decision-status.enum.js";
import type { BlockingReason } from "../../value-objects/blocking-reason.vo.js";
import type { AuthorizationDecisionId, RoleDefinitionId, PermissionPolicyId, UserIdentityId } from "../../value-objects/platform-access-ids.vo.js";
import type { AccessScope } from "../../scopes/entities/access-scope.entity.js";
import type { VersionTag } from "../../value-objects/version-tag.vo.js";
export type AuthorizationDecision = Readonly<{
    id: AuthorizationDecisionId;
    version: VersionTag;
    user_id: UserIdentityId;
    requested_action: ActionKey;
    evaluated_scope: AccessScope;
    decision_status: DecisionStatus;
    matched_roles: readonly RoleDefinitionId[];
    matched_policies: readonly PermissionPolicyId[];
    blocking_reasons: readonly BlockingReason[];
    evaluated_at: string;
}>;
export declare const createAuthorizationDecision: (input: AuthorizationDecision) => AuthorizationDecision;
//# sourceMappingURL=authorization-decision.entity.d.ts.map