import { ActionKey } from "../enums/action-key.enum.js";
import { ReadinessStatus } from "../enums/readiness-status.enum.js";
export const READINESS_PANEL_VIEW_SCHEMA_ID = "https://market-design-engine.dev/schemas/operations-console/readiness-panel-view.schema.json";
export const readinessPanelViewSchema = {
    $id: READINESS_PANEL_VIEW_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "target_ref",
        "readiness_status",
        "gating_items",
        "blocking_issues",
        "warnings",
        "recommended_next_actions",
    ],
    properties: {
        id: { type: "string", pattern: "^rpv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
        target_ref: { type: "string", minLength: 1 },
        readiness_status: { type: "string", enum: Object.values(ReadinessStatus) },
        gating_items: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["key", "satisfied", "reason_nullable"],
                properties: {
                    key: { type: "string", minLength: 1 },
                    satisfied: { type: "boolean" },
                    reason_nullable: { anyOf: [{ type: "string", minLength: 1 }, { type: "null" }] },
                },
            },
        },
        blocking_issues: { type: "array", items: { type: "string", minLength: 1 } },
        warnings: { type: "array", items: { type: "string", minLength: 1 } },
        recommended_next_actions: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["action_key", "reason"],
                properties: {
                    action_key: { type: "string", enum: Object.values(ActionKey) },
                    reason: { type: "string", minLength: 1 },
                },
            },
        },
    },
};
//# sourceMappingURL=readiness-panel-view.schema.js.map