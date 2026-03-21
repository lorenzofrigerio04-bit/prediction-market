import { ActionKey } from "../../enums/action-key.enum.js";
import { PolicyStatus } from "../../enums/policy-status.enum.js";
import type { PermissionPolicyId } from "../../value-objects/platform-access-ids.vo.js";
import type { PolicyKey } from "../../value-objects/policy-key.vo.js";
import type { AccessScope } from "../../scopes/entities/access-scope.entity.js";
import type { VersionTag } from "../../value-objects/version-tag.vo.js";
export type PermissionPolicy = Readonly<{
    id: PermissionPolicyId;
    version: VersionTag;
    policy_key: PolicyKey;
    allowed_actions: readonly ActionKey[];
    denied_actions_nullable: readonly ActionKey[] | null;
    scope_constraints: readonly AccessScope[];
    policy_status: PolicyStatus;
}>;
export declare const createPermissionPolicy: (input: PermissionPolicy) => PermissionPolicy;
//# sourceMappingURL=permission-policy.entity.d.ts.map