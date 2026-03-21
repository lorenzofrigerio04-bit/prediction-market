import type { ActionKey } from "../../enums/action-key.enum.js";
import type { PermissionPolicy } from "../entities/permission-policy.entity.js";
import type { CapabilityPolicyAdapter } from "./capability-policy-adapter.js";
import type { UserIdentityId } from "../../value-objects/platform-access-ids.vo.js";
import type { AccessScope } from "../../scopes/entities/access-scope.entity.js";
export type PermissionEvaluationResult = Readonly<{
    allowed: boolean;
    reasons: readonly string[];
}>;
export type PermissionEvaluationInput = Readonly<{
    user_id: UserIdentityId;
    action_key: ActionKey;
    evaluated_scope: AccessScope;
    policy: PermissionPolicy;
    capability_adapter: CapabilityPolicyAdapter;
}>;
export interface PermissionEvaluator {
    evaluate(input: PermissionEvaluationInput): PermissionEvaluationResult;
}
//# sourceMappingURL=permission-evaluator.d.ts.map