import { PanelKey } from "../enums/panel-key.enum.js";
import { PersistedStatePolicy } from "../enums/persisted-state-policy.enum.js";
import { ViewScope } from "../enums/view-scope.enum.js";
import { FilterOperator } from "../enums/filter-operator.enum.js";

export const CONSOLE_NAVIGATION_STATE_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/operations-console/console-navigation-state.schema.json";

export const consoleNavigationStateSchema = {
  $id: CONSOLE_NAVIGATION_STATE_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "active_panel",
    "active_filters",
    "selected_entity_ref_nullable",
    "breadcrumb_state",
    "user_scope",
    "persisted_state_policy",
  ],
  properties: {
    id: { type: "string", pattern: "^cns_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
    active_panel: { type: "string", enum: Object.values(PanelKey) },
    active_filters: {
      type: "object",
      additionalProperties: false,
      required: ["filters"],
      properties: {
        filters: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["field", "operator", "value"],
            properties: {
              field: { type: "string", minLength: 1 },
              operator: { type: "string", enum: Object.values(FilterOperator) },
              value: { type: "string", minLength: 1 },
            },
          },
        },
      },
    },
    selected_entity_ref_nullable: { anyOf: [{ type: "string", minLength: 1 }, { type: "null" }] },
    breadcrumb_state: {
      type: "object",
      additionalProperties: false,
      required: ["items"],
      properties: {
        items: { type: "array", items: { type: "string", minLength: 1 } },
      },
    },
    user_scope: { type: "string", enum: Object.values(ViewScope) },
    persisted_state_policy: { type: "string", enum: Object.values(PersistedStatePolicy) },
  },
} as const;
