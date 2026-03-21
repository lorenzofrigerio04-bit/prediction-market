import { ActionKey } from "../enums/action-key.enum.js";
import { EntryType } from "../enums/entry-type.enum.js";
export const QUEUE_ENTRY_VIEW_SCHEMA_ID = "https://market-design-engine.dev/schemas/operations-console/queue-entry-view.schema.json";
export const queueEntryViewSchema = {
    $id: QUEUE_ENTRY_VIEW_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "entry_ref",
        "entry_type",
        "display_title",
        "status",
        "priority",
        "created_at",
        "owner_nullable",
        "warnings",
        "available_actions",
    ],
    properties: {
        entry_ref: { type: "string", pattern: "^qer_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        entry_type: { type: "string", enum: Object.values(EntryType) },
        display_title: { type: "string", minLength: 1 },
        status: { type: "string", minLength: 1 },
        priority: { type: "integer", minimum: 0 },
        created_at: { type: "string", format: "date-time" },
        owner_nullable: { anyOf: [{ type: "string", minLength: 1 }, { type: "null" }] },
        warnings: { type: "array", items: { type: "string", minLength: 1 } },
        available_actions: { type: "array", items: { type: "string", enum: Object.values(ActionKey) }, uniqueItems: true },
    },
};
//# sourceMappingURL=queue-entry-view.schema.js.map