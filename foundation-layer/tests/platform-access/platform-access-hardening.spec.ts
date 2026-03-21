import { describe, expect, it } from "vitest";
import { requireSchemaValidator } from "../../src/validators/common/validation-result.js";
import * as foundation from "../../src/index.js";
import {
  ACCESS_SCOPE_SCHEMA_ID,
  ACTION_PERMISSION_CHECK_SCHEMA_ID,
  ADMIN_CAPABILITY_FLAG_SCHEMA_ID,
  AUTHORIZATION_DECISION_SCHEMA_ID,
  PERMISSION_POLICY_SCHEMA_ID,
  PLATFORM_ACTION_COMPATIBILITY_SCHEMA_ID,
  ROLE_ASSIGNMENT_SCHEMA_ID,
  ROLE_DEFINITION_SCHEMA_ID,
  USER_IDENTITY_SCHEMA_ID,
  WORKSPACE_SCHEMA_ID,
  createCapabilityFlagKey,
  createUserIdentityId,
  DeterministicCapabilityPolicyAdapter,
} from "../../src/platform-access/index.js";
import { createAdminCapabilityFlag } from "../../src/platform-access/capabilities/entities/admin-capability-flag.entity.js";
import { validateAdminCapabilityFlag } from "../../src/platform-access/validators/validate-admin-capability-flag.js";

describe("platform-access hardening requirements", () => {
  it("20 - registers every platform-access schema in AJV", () => {
    const schemaIds = [
      USER_IDENTITY_SCHEMA_ID,
      WORKSPACE_SCHEMA_ID,
      ROLE_DEFINITION_SCHEMA_ID,
      ROLE_ASSIGNMENT_SCHEMA_ID,
      PERMISSION_POLICY_SCHEMA_ID,
      ACCESS_SCOPE_SCHEMA_ID,
      AUTHORIZATION_DECISION_SCHEMA_ID,
      ACTION_PERMISSION_CHECK_SCHEMA_ID,
      ADMIN_CAPABILITY_FLAG_SCHEMA_ID,
      PLATFORM_ACTION_COMPATIBILITY_SCHEMA_ID,
    ];
    for (const schemaId of schemaIds) {
      expect(() => requireSchemaValidator(schemaId)).not.toThrow();
    }
  });

  it("21 - preserves root and namespace exports for platform-access module", () => {
    expect(typeof foundation.validateAuthorizationDecision).toBe("function");
    expect(typeof foundation.platformAccess.validateAuthorizationDecision).toBe("function");
    expect(Array.isArray(foundation.platformAccess.platformAccessSchemas)).toBe(true);
  });

  it("22 - enforces sensitive capability safety by validator and adapter", () => {
    const userId = createUserIdentityId("usr_hardening_alpha001");
    const capability = createCapabilityFlagKey("sensitive.policy_override");
    const adapter = new DeterministicCapabilityPolicyAdapter(new Map([[userId, new Set()]]));
    expect(adapter.isCapabilityGranted(userId, capability)).toBe(false);

    const report = validateAdminCapabilityFlag(
      createAdminCapabilityFlag({
        flag_key: capability,
        description: "sensitive override",
        sensitive: true,
        default_enabled: true,
      }),
    );
    expect(report.isValid).toBe(false);
  });
});
