import { describe, expect, it } from "vitest";
import { ActionKey } from "../../src/platform-access/enums/action-key.enum.js";
import { CheckStatus } from "../../src/platform-access/enums/check-status.enum.js";
import { DecisionStatus } from "../../src/platform-access/enums/decision-status.enum.js";
import { PolicyStatus } from "../../src/platform-access/enums/policy-status.enum.js";
import { RoleScopePolicy } from "../../src/platform-access/enums/role-scope-policy.enum.js";
import { ScopeType } from "../../src/platform-access/enums/scope-type.enum.js";
import { TargetModule } from "../../src/platform-access/enums/target-module.enum.js";
import { UserStatus } from "../../src/platform-access/enums/user-status.enum.js";
import { UserType } from "../../src/platform-access/enums/user-type.enum.js";
import { createActionPermissionCheck } from "../../src/platform-access/authorization/entities/action-permission-check.entity.js";
import { createAuthorizationDecision } from "../../src/platform-access/authorization/entities/authorization-decision.entity.js";
import { DeterministicAuthorizationEngine } from "../../src/platform-access/authorization/implementations/deterministic-authorization-engine.js";
import { DeterministicPlatformCompatibilityAdapter } from "../../src/platform-access/compatibility/implementations/deterministic-platform-compatibility-adapter.js";
import { createUserIdentity } from "../../src/platform-access/identities/entities/user-identity.entity.js";
import { DeterministicUserIdentityReader } from "../../src/platform-access/identities/implementations/deterministic-user-identity-reader.js";
import { createPermissionPolicy } from "../../src/platform-access/permissions/entities/permission-policy.entity.js";
import { DeterministicCapabilityPolicyAdapter } from "../../src/platform-access/permissions/implementations/deterministic-capability-policy-adapter.js";
import { DeterministicPermissionEvaluator } from "../../src/platform-access/permissions/implementations/deterministic-permission-evaluator.js";
import { createRoleAssignment } from "../../src/platform-access/roles/entities/role-assignment.entity.js";
import { createRoleDefinition } from "../../src/platform-access/roles/entities/role-definition.entity.js";
import { DeterministicRoleAssignmentManager } from "../../src/platform-access/roles/implementations/deterministic-role-assignment-manager.js";
import { DeterministicRoleRegistry } from "../../src/platform-access/roles/implementations/deterministic-role-registry.js";
import { createAccessScope } from "../../src/platform-access/scopes/entities/access-scope.entity.js";
import { DeterministicAccessScopeResolver } from "../../src/platform-access/scopes/implementations/deterministic-access-scope-resolver.js";
import {
  createActionPermissionCheckId,
  createAuthorizationDecisionId,
  createPermissionPolicyId,
  createRoleAssignmentId,
  createRoleDefinitionId,
  createUserIdentityId,
  createWorkspaceId,
  type UserIdentityId,
} from "../../src/platform-access/value-objects/platform-access-ids.vo.js";
import { createActionPermission } from "../../src/platform-access/value-objects/action-permission.vo.js";
import { createCapabilityFlagKey } from "../../src/platform-access/value-objects/capability-flag-key.vo.js";
import { createBlockingReason } from "../../src/platform-access/value-objects/blocking-reason.vo.js";
import { createDisplayName } from "../../src/platform-access/value-objects/display-name.vo.js";
import { createEntityScope } from "../../src/platform-access/value-objects/entity-scope.vo.js";
import { createPolicyKey } from "../../src/platform-access/value-objects/policy-key.vo.js";
import { createRoleKey } from "../../src/platform-access/value-objects/role-key.vo.js";
import { createVersionTag } from "../../src/platform-access/value-objects/version-tag.vo.js";
import { validateAccessScope } from "../../src/platform-access/validators/validate-access-scope.js";
import { validateActionPermissionCheck } from "../../src/platform-access/validators/validate-action-permission-check.js";
import { validateAuthorizationDecision } from "../../src/platform-access/validators/validate-authorization-decision.js";
import { validatePermissionPolicy } from "../../src/platform-access/validators/validate-permission-policy.js";
import { validateRoleAssignment } from "../../src/platform-access/validators/validate-role-assignment.js";
import { validateUserIdentity } from "../../src/platform-access/validators/validate-user-identity.js";

const USER_ID = createUserIdentityId("usr_operator_alpha001");
const WORKSPACE_ID = createWorkspaceId("wsp_editorial_alpha001");
const ROLE_ID = createRoleDefinitionId("rol_editorial_alpha001");
const SENSITIVE_FLAG = createCapabilityFlagKey("sensitive.editorial_override");

const makeScope = () =>
  createAccessScope({
    scope_type: ScopeType.WORKSPACE_MODULE,
    workspace_id_nullable: WORKSPACE_ID,
    module_scope_nullable: TargetModule.EDITORIAL,
    entity_scope_nullable: null,
    notes_nullable: "editorial workspace scope",
  });

const makeRole = () =>
  createRoleDefinition({
    id: ROLE_ID,
    version: createVersionTag("v1.0.0"),
    role_key: createRoleKey("editorial_operator"),
    display_name: createDisplayName("Editorial Operator"),
    permission_set: [createActionPermission("editorial:view"), createActionPermission("editorial:review")],
    role_scope_policy: RoleScopePolicy.WORKSPACE_ONLY,
    active: true,
  });

const makeAssignment = () =>
  createRoleAssignment({
    id: createRoleAssignmentId("asg_editorial_alpha001"),
    version: createVersionTag("v1.0.0"),
    user_id: USER_ID,
    role_id: ROLE_ID,
    workspace_id_nullable: WORKSPACE_ID,
    access_scope: makeScope(),
    assigned_by: USER_ID,
    assigned_at: "2026-03-09T00:00:00.000Z",
    active: true,
  });

const makeUser = (overrides?: Partial<ReturnType<typeof createUserIdentity>>) =>
  createUserIdentity({
    id: USER_ID,
    version: createVersionTag("v1.0.0"),
    display_name: createDisplayName("Editorial User"),
    user_type: UserType.HUMAN_OPERATOR,
    status: UserStatus.ACTIVE,
    primary_workspace_id_nullable: WORKSPACE_ID,
    capability_flags: [],
    metadata: { source: "test" },
    ...overrides,
  });

const makePolicy = (overrides?: Partial<ReturnType<typeof createPermissionPolicy>>) =>
  createPermissionPolicy({
    id: createPermissionPolicyId("pol_editorial_alpha001"),
    version: createVersionTag("v1.0.0"),
    policy_key: createPolicyKey("editorial_read_review"),
    allowed_actions: [ActionKey.VIEW_EDITORIAL_QUEUE, ActionKey.REVIEW_CANDIDATE],
    denied_actions_nullable: null,
    scope_constraints: [makeScope()],
    policy_status: PolicyStatus.ACTIVE,
    ...overrides,
  });

const makeDecision = (overrides?: Partial<ReturnType<typeof createAuthorizationDecision>>) =>
  createAuthorizationDecision({
    id: createAuthorizationDecisionId("adz_editorial_alpha001"),
    version: createVersionTag("v1.0.0"),
    user_id: USER_ID,
    requested_action: ActionKey.VIEW_EDITORIAL_QUEUE,
    evaluated_scope: makeScope(),
    decision_status: DecisionStatus.ALLOWED,
    matched_roles: [ROLE_ID],
    matched_policies: [createPermissionPolicyId("pol_editorial_alpha001")],
    blocking_reasons: [],
    evaluated_at: "2026-03-09T00:00:00.000Z",
    ...overrides,
  });

const makeEngine = (input?: {
  user?: ReturnType<typeof createUserIdentity>;
  assignment?: ReturnType<typeof createRoleAssignment>;
  role?: ReturnType<typeof createRoleDefinition>;
  policies?: readonly ReturnType<typeof createPermissionPolicy>[];
  resolverScopes?: ReadonlyMap<UserIdentityId, readonly ReturnType<typeof createAccessScope>[]>;
  grantedCapabilities?: ReadonlySet<ReturnType<typeof createCapabilityFlagKey>>;
}) =>
  new DeterministicAuthorizationEngine({
    user_identity_reader: new DeterministicUserIdentityReader([input?.user ?? makeUser()]),
    role_assignment_manager: new DeterministicRoleAssignmentManager([input?.assignment ?? makeAssignment()]),
    role_registry: new DeterministicRoleRegistry([input?.role ?? makeRole()]),
    permission_policies: input?.policies ?? [makePolicy()],
    permission_evaluator: new DeterministicPermissionEvaluator(),
    capability_policy_adapter: new DeterministicCapabilityPolicyAdapter(
      new Map([[USER_ID, input?.grantedCapabilities ?? new Set()]]),
    ),
    platform_compatibility_adapter: new DeterministicPlatformCompatibilityAdapter(),
    access_scope_resolver: new DeterministicAccessScopeResolver(
      input?.resolverScopes ?? new Map([[USER_ID, [makeScope()]]]),
    ),
  });

describe("platform-access v1 core requirements", () => {
  it("01 - validates UserIdentity with all mandatory fields", () => {
    expect(validateUserIdentity(makeUser()).isValid).toBe(true);
  });

  it("02 - validates active RoleAssignment with context user+role", () => {
    expect(
      validateRoleAssignment(makeAssignment(), undefined, {
        user_exists: () => true,
        role_exists: () => true,
      }).isValid,
    ).toBe(true);
  });

  it("03 - rejects active RoleAssignment when context user is missing", () => {
    expect(
      validateRoleAssignment(makeAssignment(), undefined, {
        user_exists: () => false,
        role_exists: () => true,
      }).isValid,
    ).toBe(false);
  });

  it("04 - rejects active RoleAssignment when context role is missing", () => {
    expect(
      validateRoleAssignment(makeAssignment(), undefined, {
        user_exists: () => true,
        role_exists: () => false,
      }).isValid,
    ).toBe(false);
  });

  it("05 - rejects DENIED AuthorizationDecision without blocking reasons", () => {
    const invalidDeniedDecision = {
      ...makeDecision(),
      decision_status: DecisionStatus.DENIED,
      blocking_reasons: [],
    } as const;
    expect(
      validateAuthorizationDecision(
        invalidDeniedDecision as unknown as ReturnType<typeof createAuthorizationDecision>,
      ).isValid,
    ).toBe(false);
  });

  it("06 - rejects ALLOWED AuthorizationDecision with blocking reasons", () => {
    const invalidAllowedDecision = {
      ...makeDecision(),
      decision_status: DecisionStatus.ALLOWED,
      blocking_reasons: [createBlockingReason("must_not_exist")],
    } as const;
    expect(
      validateAuthorizationDecision(
        invalidAllowedDecision as unknown as ReturnType<typeof createAuthorizationDecision>,
      ).isValid,
    ).toBe(false);
  });

  it("07 - rejects PermissionPolicy when allowed_actions is empty", () => {
    const invalidPolicy = {
      ...makePolicy(),
      allowed_actions: [],
    } as const;
    expect(validatePermissionPolicy(invalidPolicy as unknown as ReturnType<typeof createPermissionPolicy>).isValid).toBe(
      false,
    );
  });

  it("08 - rejects workspace-specific AccessScope without workspace_id", () => {
    const invalidScope = {
      ...makeScope(),
      scope_type: ScopeType.WORKSPACE,
      workspace_id_nullable: null,
    } as const;
    expect(
      validateAccessScope(invalidScope as unknown as ReturnType<typeof createAccessScope>).isValid,
    ).toBe(false);
  });

  it("08b - createAccessScope rejects workspace-module scope without workspace_id", () => {
    expect(() =>
      createAccessScope({
        scope_type: ScopeType.WORKSPACE_MODULE,
        workspace_id_nullable: null,
        module_scope_nullable: TargetModule.EDITORIAL,
        entity_scope_nullable: null,
        notes_nullable: null,
      }),
    ).toThrow();
  });

  it("09 - rejects ActionPermissionCheck PASSED when context decision is DENIED", () => {
    const deniedDecision = makeDecision({
      id: createAuthorizationDecisionId("adz_editorial_denied001"),
      decision_status: DecisionStatus.DENIED,
      blocking_reasons: [createBlockingReason("policy_blocked")],
    });
    expect(
      validateActionPermissionCheck(
        createActionPermissionCheck({
          id: createActionPermissionCheckId("chk_editorial_denied001"),
          version: createVersionTag("v1.0.0"),
          action_key: deniedDecision.requested_action,
          target_module: TargetModule.EDITORIAL,
          target_entity_type_nullable: null,
          required_permission: createActionPermission("editorial:view"),
          decision_ref: deniedDecision.id,
          check_status: CheckStatus.PASSED,
        }),
        undefined,
        { decision: deniedDecision },
      ).isValid,
    ).toBe(false);
  });

  it("10 - rejects ActionPermissionCheck when decision_ref does not match context decision", () => {
    const decision = makeDecision();
    expect(
      validateActionPermissionCheck(
        createActionPermissionCheck({
          id: createActionPermissionCheckId("chk_editorial_mismatch001"),
          version: createVersionTag("v1.0.0"),
          action_key: decision.requested_action,
          target_module: TargetModule.EDITORIAL,
          target_entity_type_nullable: "candidate_market",
          required_permission: createActionPermission("editorial:view"),
          decision_ref: createAuthorizationDecisionId("adz_other_reference001"),
          check_status: CheckStatus.FAILED,
        }),
        undefined,
        { decision },
      ).isValid,
    ).toBe(false);
  });

  it("11 - allows deterministic authorization on coherent workspace path", () => {
    const decision = makeEngine().authorize({
      user_id: USER_ID,
      target_module: TargetModule.EDITORIAL,
      action_key: ActionKey.VIEW_EDITORIAL_QUEUE,
      workspace_id_nullable: WORKSPACE_ID,
    });
    expect(decision.decision_status).toBe(DecisionStatus.ALLOWED);
    expect(decision.blocking_reasons).toEqual([]);
  });

  it("12 - denies deterministic authorization when user is inactive", () => {
    const decision = makeEngine({ user: makeUser({ status: UserStatus.SUSPENDED }) }).authorize({
      user_id: USER_ID,
      target_module: TargetModule.EDITORIAL,
      action_key: ActionKey.VIEW_EDITORIAL_QUEUE,
      workspace_id_nullable: WORKSPACE_ID,
    });
    expect(decision.decision_status).toBe(DecisionStatus.DENIED);
    expect(decision.blocking_reasons).toContain(createBlockingReason("user_inactive"));
  });

  it("13 - applies deny-first policy evaluation when explicit deny exists", () => {
    const decision = makeEngine({
      policies: [
        makePolicy(),
        makePolicy({
          id: createPermissionPolicyId("pol_editorial_deny001"),
          policy_key: createPolicyKey("editorial_deny_view"),
          allowed_actions: [ActionKey.VIEW_EDITORIAL_QUEUE],
          denied_actions_nullable: [ActionKey.VIEW_EDITORIAL_QUEUE],
        }),
      ],
    }).authorize({
      user_id: USER_ID,
      target_module: TargetModule.EDITORIAL,
      action_key: ActionKey.VIEW_EDITORIAL_QUEUE,
      workspace_id_nullable: WORKSPACE_ID,
    });
    expect(decision.decision_status).toBe(DecisionStatus.DENIED);
    expect(decision.blocking_reasons).toContain(createBlockingReason("deny_first_policy_block"));
  });

  it("14 - denies sensitive action when explicit capability grant is missing", () => {
    const decision = makeEngine({
      user: makeUser({ capability_flags: [] }),
      role: createRoleDefinition({
        id: ROLE_ID,
        version: createVersionTag("v1.0.0"),
        role_key: createRoleKey("editorial_override"),
        display_name: createDisplayName("Editorial Override"),
        permission_set: [createActionPermission("editorial:override")],
        role_scope_policy: RoleScopePolicy.WORKSPACE_ONLY,
        active: true,
      }),
      policies: [
        makePolicy({
          id: createPermissionPolicyId("pol_editorial_override001"),
          policy_key: createPolicyKey("editorial_override_policy"),
          allowed_actions: [ActionKey.OVERRIDE_EDITORIAL_DECISION],
          denied_actions_nullable: null,
        }),
      ],
    }).authorize({
      user_id: USER_ID,
      target_module: TargetModule.EDITORIAL,
      action_key: ActionKey.OVERRIDE_EDITORIAL_DECISION,
      workspace_id_nullable: WORKSPACE_ID,
      evaluated_scope: createAccessScope({
        scope_type: ScopeType.WORKSPACE_ENTITY,
        workspace_id_nullable: WORKSPACE_ID,
        module_scope_nullable: TargetModule.EDITORIAL,
        entity_scope_nullable: createEntityScope("candidate:001"),
        notes_nullable: null,
      }),
    });
    expect(decision.decision_status).toBe(DecisionStatus.DENIED);
    expect(decision.blocking_reasons.some((reason) => reason.includes(SENSITIVE_FLAG as string))).toBe(true);
  });
});
