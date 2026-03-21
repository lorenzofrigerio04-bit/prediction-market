import { ActionKey } from "../enums/action-key.enum.js";
import { EntryType } from "../enums/entry-type.enum.js";
export declare const QUEUE_ENTRY_VIEW_SCHEMA_ID = "https://market-design-engine.dev/schemas/operations-console/queue-entry-view.schema.json";
export declare const queueEntryViewSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/queue-entry-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["entry_ref", "entry_type", "display_title", "status", "priority", "created_at", "owner_nullable", "warnings", "available_actions"];
    readonly properties: {
        readonly entry_ref: {
            readonly type: "string";
            readonly pattern: "^qer_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly entry_type: {
            readonly type: "string";
            readonly enum: EntryType[];
        };
        readonly display_title: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly status: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly priority: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly created_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly owner_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
                readonly minLength: 1;
            }, {
                readonly type: "null";
            }];
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly available_actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: ActionKey[];
            };
            readonly uniqueItems: true;
        };
    };
};
//# sourceMappingURL=queue-entry-view.schema.d.ts.map