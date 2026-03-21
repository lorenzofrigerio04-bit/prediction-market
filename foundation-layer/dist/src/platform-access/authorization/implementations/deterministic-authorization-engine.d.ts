import { type AuthorizationDecision } from "../entities/authorization-decision.entity.js";
import type { AuthorizationEngine, AuthorizationRequest } from "../interfaces/authorization-engine.js";
import type { UserIdentityReader } from "../../identities/interfaces/user-identity-reader.js";
import type { PermissionPolicy } from "../../permissions/entities/permission-policy.entity.js";
import type { CapabilityPolicyAdapter } from "../../permissions/interfaces/capability-policy-adapter.js";
import type { PermissionEvaluator } from "../../permissions/interfaces/permission-evaluator.js";
import type { RoleAssignmentManager } from "../../roles/interfaces/role-assignment-manager.js";
import type { RoleRegistry } from "../../roles/interfaces/role-registry.js";
import type { AccessScopeResolver } from "../../scopes/interfaces/access-scope-resolver.js";
import type { PlatformCompatibilityAdapter } from "../../compatibility/interfaces/platform-compatibility-adapter.js";
export type DeterministicAuthorizationEngineDependencies = Readonly<{
    user_identity_reader: UserIdentityReader;
    role_assignment_manager: RoleAssignmentManager;
    role_registry: RoleRegistry;
    permission_policies: readonly PermissionPolicy[];
    permission_evaluator: PermissionEvaluator;
    capability_policy_adapter: CapabilityPolicyAdapter;
    platform_compatibility_adapter: PlatformCompatibilityAdapter;
    access_scope_resolver: AccessScopeResolver;
}>;
export declare class DeterministicAuthorizationEngine implements AuthorizationEngine {
    private readonly deps;
    constructor(deps: DeterministicAuthorizationEngineDependencies);
    authorize(request: AuthorizationRequest): AuthorizationDecision;
}
//# sourceMappingURL=deterministic-authorization-engine.d.ts.map