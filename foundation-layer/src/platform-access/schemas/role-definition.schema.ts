import { RoleScopePolicy } from "../enums/role-scope-policy.enum.js";

export const ROLE_DEFINITION_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/platform-access/role-definition.schema.json";

export const roleDefinitionSchema = {
  $id: ROLE_DEFINITION_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["id", "version", "role_key", "display_name", "permission_set", "role_scope_policy", "active"],
  properties: {
    id: { type: "string", pattern: "^rol_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
    role_key: { type: "string", minLength: 1 },
    display_name: { type: "string", minLength: 1 },
    permission_set: {
      type: "array",
      items: { type: "string", minLength: 1 },
      minItems: 1,
      uniqueItems: true,
    },
    role_scope_policy: { type: "string", enum: Object.values(RoleScopePolicy) },
    active: { type: "boolean" },
  },
} as const;
