import { DecisionStatus } from "../../enums/decision-status.enum.js";
import { PolicyStatus } from "../../enums/policy-status.enum.js";
import { RoleScopePolicy } from "../../enums/role-scope-policy.enum.js";
import { ScopeType } from "../../enums/scope-type.enum.js";
import { UserStatus } from "../../enums/user-status.enum.js";
import { createAuthorizationDecision, type AuthorizationDecision } from "../entities/authorization-decision.entity.js";
import type { AuthorizationEngine, AuthorizationRequest } from "../interfaces/authorization-engine.js";
import type { UserIdentityReader } from "../../identities/interfaces/user-identity-reader.js";
import type { PermissionPolicy } from "../../permissions/entities/permission-policy.entity.js";
import type { CapabilityPolicyAdapter } from "../../permissions/interfaces/capability-policy-adapter.js";
import type { PermissionEvaluator } from "../../permissions/interfaces/permission-evaluator.js";
import type { RoleAssignmentManager } from "../../roles/interfaces/role-assignment-manager.js";
import type { RoleRegistry } from "../../roles/interfaces/role-registry.js";
import type { AccessScopeResolver } from "../../scopes/interfaces/access-scope-resolver.js";
import type { AccessScope } from "../../scopes/entities/access-scope.entity.js";
import type { PlatformCompatibilityAdapter } from "../../compatibility/interfaces/platform-compatibility-adapter.js";
import {
  createAuthorizationDecisionId,
  type PermissionPolicyId,
  type RoleDefinitionId,
} from "../../value-objects/platform-access-ids.vo.js";
import { createBlockingReason } from "../../value-objects/blocking-reason.vo.js";
import { createVersionTag } from "../../value-objects/version-tag.vo.js";

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

const createDecisionId = (request: AuthorizationRequest): ReturnType<typeof createAuthorizationDecisionId> => {
  const seed = `${request.user_id as string}|${request.target_module}|${request.action_key}|${
    request.workspace_id_nullable === null ? "global" : (request.workspace_id_nullable as string)
  }`;
  const token = seed.replace(/[^a-zA-Z0-9]/g, "").slice(0, 24).padEnd(6, "0");
  return createAuthorizationDecisionId(`adz_${token}`);
};

const createEvaluatedScope = (request: AuthorizationRequest): AccessScope => {
  if (request.evaluated_scope !== undefined) {
    return request.evaluated_scope;
  }
  if (request.workspace_id_nullable === null) {
    return {
      scope_type: ScopeType.MODULE,
      workspace_id_nullable: null,
      module_scope_nullable: request.target_module,
      entity_scope_nullable: null,
      notes_nullable: "deterministic_default_module_scope",
    };
  }
  return {
    scope_type: ScopeType.WORKSPACE_MODULE,
    workspace_id_nullable: request.workspace_id_nullable,
    module_scope_nullable: request.target_module,
    entity_scope_nullable: null,
    notes_nullable: "deterministic_default_workspace_module_scope",
  };
};

const isSensitiveCapability = (capability: string): boolean =>
  capability.startsWith("sensitive.") || capability.startsWith("admin.") || capability.startsWith("root.");

const matchesScopeType = (actual: ScopeType, required: ScopeType): boolean => {
  if (actual === required) {
    return true;
  }
  if (required === ScopeType.MODULE && actual === ScopeType.WORKSPACE_MODULE) {
    return true;
  }
  if (required === ScopeType.ENTITY && actual === ScopeType.WORKSPACE_ENTITY) {
    return true;
  }
  return false;
};

const requiredPermissionFromRequest = (target_module: string, action_key: string): string =>
  `${target_module}:${action_key}`;

const hasMatchingRolePermission = (
  permission_set: readonly unknown[],
  target_module: string,
  action_key: string,
): boolean => {
  const canonicalPermission = requiredPermissionFromRequest(target_module, action_key);
  const legacyActionScopedPermission = `${target_module.toLowerCase()}:${action_key.toLowerCase()}`;
  const moduleScopedPrefix = `${target_module.toLowerCase()}:`;
  return permission_set.some((permission) => {
    const permissionText = String(permission);
    return (
      permissionText === canonicalPermission ||
      permissionText === legacyActionScopedPermission ||
      permissionText.startsWith(moduleScopedPrefix)
    );
  });
};

const scopeMatchesScopeConstraint = (scope: AccessScope, constraint: AccessScope): boolean => {
  if (constraint.scope_type !== scope.scope_type) {
    return false;
  }
  if (
    constraint.workspace_id_nullable !== null &&
    constraint.workspace_id_nullable !== scope.workspace_id_nullable
  ) {
    return false;
  }
  if (
    constraint.module_scope_nullable !== null &&
    constraint.module_scope_nullable !== scope.module_scope_nullable
  ) {
    return false;
  }
  if (
    constraint.entity_scope_nullable !== null &&
    constraint.entity_scope_nullable !== scope.entity_scope_nullable
  ) {
    return false;
  }
  return true;
};

const scopeCovers = (granted: AccessScope, requested: AccessScope): boolean => {
  if (granted.scope_type === ScopeType.GLOBAL) {
    return true;
  }
  return scopeMatchesScopeConstraint(requested, granted);
};

const roleScopePolicyMatches = (
  role_scope_policy: RoleScopePolicy,
  request: AuthorizationRequest,
  assignment_scope: AccessScope,
): boolean => {
  if (role_scope_policy === RoleScopePolicy.GLOBAL_ONLY) {
    return request.workspace_id_nullable === null && assignment_scope.scope_type === ScopeType.GLOBAL;
  }
  if (role_scope_policy === RoleScopePolicy.WORKSPACE_ONLY) {
    return request.workspace_id_nullable !== null;
  }
  if (role_scope_policy === RoleScopePolicy.MODULE_BOUND) {
    return assignment_scope.module_scope_nullable === request.target_module;
  }
  return true;
};

export class DeterministicAuthorizationEngine implements AuthorizationEngine {
  constructor(private readonly deps: DeterministicAuthorizationEngineDependencies) {}

  authorize(request: AuthorizationRequest): AuthorizationDecision {
    const reasons = new Set<string>();
    const decisionId = createDecisionId(request);
    const evaluatedScope = createEvaluatedScope(request);
    const matchedRoles = new Set<RoleDefinitionId>();
    const matchedPolicies = new Set<PermissionPolicyId>();

    const user = this.deps.user_identity_reader.getById(request.user_id);
    if (user === null) {
      return createAuthorizationDecision({
        id: decisionId,
        version: createVersionTag("v1.0.0"),
        user_id: request.user_id,
        requested_action: request.action_key,
        evaluated_scope: evaluatedScope,
        decision_status: DecisionStatus.DENIED,
        blocking_reasons: [createBlockingReason("user_not_found")],
        matched_roles: [],
        matched_policies: [],
        evaluated_at: "1970-01-01T00:00:00.000Z",
      });
    }

    if (user.status !== UserStatus.ACTIVE) {
      reasons.add("user_inactive");
    }

    const compatibility = this.deps.platform_compatibility_adapter.findByModuleAndAction(
      request.target_module,
      request.action_key,
    );
    if (compatibility === null || !compatibility.active) {
      reasons.add("module_action_incompatible");
    } else {
      if (!matchesScopeType(evaluatedScope.scope_type, compatibility.required_scope_type)) {
        reasons.add("scope_type_incompatible_with_module_action");
      }
      for (const requiredCapability of compatibility.required_capabilities_nullable ?? []) {
        const capabilityText = requiredCapability as string;
        const explicitlyGranted =
          user.capability_flags.includes(requiredCapability) &&
          this.deps.capability_policy_adapter.isCapabilityGranted(request.user_id, requiredCapability);
        if (!explicitlyGranted) {
          reasons.add(`missing_capability:${capabilityText}`);
        } else if (isSensitiveCapability(capabilityText) && !user.capability_flags.includes(requiredCapability)) {
          reasons.add(`missing_sensitive_capability:${capabilityText}`);
        }
      }
    }

    const resolverScopes = this.deps.access_scope_resolver.listForUser(request.user_id);
    const assignments = this.deps.role_assignment_manager.listForUser(request.user_id);
    const activeAssignments = assignments.filter((assignment) => assignment.active);
    if (activeAssignments.length === 0) {
      reasons.add("no_active_role_assignments");
    }

    let roleMatched = false;
    for (const assignment of activeAssignments) {
      const role = this.deps.role_registry.getById(assignment.role_id);
      if (role === null) {
        reasons.add("role_definition_missing");
        continue;
      }
      if (!role.active) {
        reasons.add("role_inactive");
        continue;
      }
      if (
        assignment.workspace_id_nullable !== null &&
        request.workspace_id_nullable !== assignment.workspace_id_nullable
      ) {
        reasons.add("assignment_workspace_mismatch");
        continue;
      }
      if (!roleScopePolicyMatches(role.role_scope_policy, request, assignment.access_scope)) {
        reasons.add("role_scope_policy_mismatch");
        continue;
      }
      if (!hasMatchingRolePermission(role.permission_set, request.target_module, request.action_key)) {
        reasons.add("role_permission_missing");
        continue;
      }
      if (!scopeCovers(assignment.access_scope, evaluatedScope)) {
        reasons.add("assignment_scope_incompatible");
        continue;
      }
      const hasResolverOverride = resolverScopes.some((scope) => scopeCovers(scope, evaluatedScope));
      if (resolverScopes.length > 0 && !hasResolverOverride) {
        reasons.add("resolver_scope_incompatible");
        continue;
      }

      roleMatched = true;
      matchedRoles.add(role.id);
    }

    if (!roleMatched) {
      reasons.add("no_role_scope_match");
    }

    let hasPolicyAllow = false;
    let hasPolicyDeny = false;
    const activePolicies = this.deps.permission_policies.filter(
      (policy) => policy.policy_status === PolicyStatus.ACTIVE,
    );
    for (const policy of activePolicies) {
      const policyResult = this.deps.permission_evaluator.evaluate({
        user_id: request.user_id,
        action_key: request.action_key,
        evaluated_scope: evaluatedScope,
        policy,
        capability_adapter: this.deps.capability_policy_adapter,
      });
      if (policy.allowed_actions.includes(request.action_key) || (policy.denied_actions_nullable?.includes(request.action_key) ?? false)) {
        matchedPolicies.add(policy.id);
      }
      if (policyResult.reasons.includes("action_explicitly_denied")) {
        hasPolicyDeny = true;
      }
      if (policyResult.allowed) {
        hasPolicyAllow = true;
      }
      for (const reason of policyResult.reasons) {
        if (reason !== "action_not_allowed_by_policy") {
          reasons.add(reason);
        }
      }
    }

    if (hasPolicyDeny) {
      reasons.add("deny_first_policy_block");
    }
    if (!hasPolicyAllow) {
      reasons.add("no_allowing_policy");
    }

    if (reasons.size === 0 && roleMatched && hasPolicyAllow && !hasPolicyDeny) {
      return createAuthorizationDecision({
        id: decisionId,
        version: createVersionTag("v1.0.0"),
        user_id: request.user_id,
        requested_action: request.action_key,
        evaluated_scope: evaluatedScope,
        decision_status: DecisionStatus.ALLOWED,
        blocking_reasons: [],
        matched_roles: [...matchedRoles].sort(),
        matched_policies: [...matchedPolicies].sort(),
        evaluated_at: "1970-01-01T00:00:00.000Z",
      });
    }

    const blockingReasons = [...reasons].sort().map((reason) => createBlockingReason(reason));
    return createAuthorizationDecision({
      id: decisionId,
      version: createVersionTag("v1.0.0"),
      user_id: request.user_id,
      requested_action: request.action_key,
      evaluated_scope: evaluatedScope,
      decision_status: DecisionStatus.DENIED,
      blocking_reasons: blockingReasons.length === 0 ? [createBlockingReason("deny_first_default")] : blockingReasons,
      matched_roles: [...matchedRoles].sort(),
      matched_policies: [...matchedPolicies].sort(),
      evaluated_at: "1970-01-01T00:00:00.000Z",
    });
  }
}
