import { PanelKey } from "../enums/panel-key.enum.js";
import { QueueScope } from "../enums/queue-scope.enum.js";
import { FilterOperator } from "../enums/filter-operator.enum.js";
import { SortDirection } from "../enums/sort-direction.enum.js";
import { VisibilityStatus } from "../enums/visibility-status.enum.js";
export const QUEUE_PANEL_VIEW_SCHEMA_ID = "https://market-design-engine.dev/schemas/operations-console/queue-panel-view.schema.json";
export const queuePanelViewSchema = {
    $id: QUEUE_PANEL_VIEW_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "panel_key",
        "queue_scope",
        "entries",
        "filters",
        "sort_config",
        "summary_counts",
        "visibility_rules",
    ],
    properties: {
        id: { type: "string", pattern: "^qpv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
        panel_key: { type: "string", enum: Object.values(PanelKey) },
        queue_scope: { type: "string", enum: Object.values(QueueScope) },
        entries: { type: "array", items: { $ref: "https://market-design-engine.dev/schemas/operations-console/queue-entry-view.schema.json" } },
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
        sort_config: {
            type: "object",
            additionalProperties: false,
            required: ["sort_field", "sort_direction"],
            properties: {
                sort_field: { type: "string", minLength: 1 },
                sort_direction: { type: "string", enum: Object.values(SortDirection) },
            },
        },
        summary_counts: {
            type: "object",
            additionalProperties: false,
            required: ["total", "ready", "blocked", "warnings"],
            properties: {
                total: { type: "integer", minimum: 0 },
                ready: { type: "integer", minimum: 0 },
                blocked: { type: "integer", minimum: 0 },
                warnings: { type: "integer", minimum: 0 },
            },
        },
        visibility_rules: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["permission_key", "expected_visibility"],
                properties: {
                    permission_key: { type: "string", minLength: 1 },
                    expected_visibility: { type: "string", enum: Object.values(VisibilityStatus) },
                },
            },
        },
    },
};
//# sourceMappingURL=queue-panel-view.schema.js.map