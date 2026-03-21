import { ScopeType } from "../../enums/scope-type.enum.js";
import { PolicyStatus } from "../../enums/policy-status.enum.js";
import type { PermissionEvaluator, PermissionEvaluationInput, PermissionEvaluationResult } from "../interfaces/permission-evaluator.js";
import type { AccessScope } from "../../scopes/entities/access-scope.entity.js";

const scopeSatisfiesConstraint = (scope: AccessScope, constraint: AccessScope): boolean => {
  if (constraint.scope_type !== scope.scope_type) {
    return false;
  }
  if (
    constraint.workspace_id_nullable !== null &&
    scope.workspace_id_nullable !== constraint.workspace_id_nullable
  ) {
    return false;
  }
  if (
    constraint.module_scope_nullable !== null &&
    scope.module_scope_nullable !== constraint.module_scope_nullable
  ) {
    return false;
  }
  if (
    constraint.entity_scope_nullable !== null &&
    scope.entity_scope_nullable !== constraint.entity_scope_nullable
  ) {
    return false;
  }
  return true;
};

const isScopeAllowedByPolicy = (scope: AccessScope, policyInput: PermissionEvaluationInput["policy"]): boolean => {
  if (policyInput.scope_constraints.length === 0) {
    return true;
  }
  if (scope.scope_type === ScopeType.GLOBAL) {
    return policyInput.scope_constraints.some((constraint) => constraint.scope_type === ScopeType.GLOBAL);
  }
  return policyInput.scope_constraints.some((constraint) => scopeSatisfiesConstraint(scope, constraint));
};

export class DeterministicPermissionEvaluator implements PermissionEvaluator {
  evaluate(input: PermissionEvaluationInput): PermissionEvaluationResult {
    const reasons: string[] = [];
    if (input.policy.policy_status !== PolicyStatus.ACTIVE) {
      reasons.push("policy_inactive");
    }
    if (input.policy.denied_actions_nullable?.includes(input.action_key) ?? false) {
      reasons.push("action_explicitly_denied");
    }
    if (!input.policy.allowed_actions.includes(input.action_key)) {
      reasons.push("action_not_allowed_by_policy");
    }
    if (!isScopeAllowedByPolicy(input.evaluated_scope, input.policy)) {
      reasons.push("policy_scope_mismatch");
    }
    return {
      allowed: reasons.length === 0,
      reasons: [...new Set(reasons)],
    };
  }
}
