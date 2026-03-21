import { ActionKey } from "../enums/action-key.enum.js";
import { DecisionStatus } from "../enums/decision-status.enum.js";
import { ScopeType } from "../enums/scope-type.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";

export const AUTHORIZATION_DECISION_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/platform-access/authorization-decision.schema.json";

export const authorizationDecisionSchema = {
  $id: AUTHORIZATION_DECISION_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "user_id",
    "requested_action",
    "evaluated_scope",
    "decision_status",
    "matched_roles",
    "matched_policies",
    "blocking_reasons",
    "evaluated_at",
  ],
  properties: {
    id: { type: "string", pattern: "^adz_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
    user_id: { type: "string", pattern: "^usr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    requested_action: { type: "string", enum: Object.values(ActionKey) },
    evaluated_scope: {
      type: "object",
      additionalProperties: false,
      required: ["scope_type", "workspace_id_nullable", "module_scope_nullable", "entity_scope_nullable", "notes_nullable"],
      properties: {
        scope_type: { type: "string", enum: Object.values(ScopeType) },
        workspace_id_nullable: {
          anyOf: [{ type: "null" }, { type: "string", pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" }],
        },
        module_scope_nullable: { anyOf: [{ type: "null" }, { type: "string", enum: Object.values(TargetModule) }] },
        entity_scope_nullable: { anyOf: [{ type: "null" }, { type: "string", minLength: 1 }] },
        notes_nullable: { anyOf: [{ type: "null" }, { type: "string" }] },
      },
    },
    decision_status: { type: "string", enum: Object.values(DecisionStatus) },
    matched_roles: {
      type: "array",
      items: { type: "string", pattern: "^rol_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
      uniqueItems: true,
    },
    matched_policies: {
      type: "array",
      items: { type: "string", pattern: "^pol_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
      uniqueItems: true,
    },
    blocking_reasons: { type: "array", items: { type: "string", minLength: 1 } },
    evaluated_at: { type: "string", minLength: 1 },
  },
} as const;
