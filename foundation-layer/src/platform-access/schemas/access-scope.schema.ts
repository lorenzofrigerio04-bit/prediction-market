import { TargetModule } from "../enums/target-module.enum.js";
import { ScopeType } from "../enums/scope-type.enum.js";

export const ACCESS_SCOPE_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/platform-access/access-scope.schema.json";

export const accessScopeSchema = {
  $id: ACCESS_SCOPE_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["scope_type", "workspace_id_nullable", "module_scope_nullable", "entity_scope_nullable", "notes_nullable"],
  properties: {
    scope_type: { type: "string", enum: Object.values(ScopeType) },
    workspace_id_nullable: { anyOf: [{ type: "null" }, { type: "string", pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" }] },
    module_scope_nullable: { anyOf: [{ type: "null" }, { type: "string", enum: Object.values(TargetModule) }] },
    entity_scope_nullable: { anyOf: [{ type: "null" }, { type: "string", minLength: 1 }] },
    notes_nullable: { anyOf: [{ type: "null" }, { type: "string" }] },
  },
} as const;
