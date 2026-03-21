import { HandoffStatus } from "../enums/handoff-status.enum.js";
export declare const PUBLICATION_HANDOFF_SCHEMA_ID = "https://market-design-engine.dev/schemas/live-integration/publication-handoff.schema.json";
export declare const publicationHandoffSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/publication-handoff.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publication_package_id", "handoff_status", "initiated_by", "initiated_at", "delivery_notes", "audit_ref"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^phnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v?[0-9]+\\.[0-9]+\\.[0-9]+$";
        };
        readonly publication_package_id: {
            readonly type: "string";
            readonly pattern: "^ppkg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly handoff_status: {
            readonly type: "string";
            readonly enum: HandoffStatus[];
        };
        readonly initiated_by: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly initiated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly delivery_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly audit_ref: {
            readonly type: "string";
            readonly pattern: "^aref_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
    };
};
//# sourceMappingURL=publication-handoff.schema.d.ts.map