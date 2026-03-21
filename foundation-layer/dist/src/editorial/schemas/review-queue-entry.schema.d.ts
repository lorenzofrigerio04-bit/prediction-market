import { PriorityLevel } from "../enums/priority-level.enum.js";
import { QueueStatus } from "../enums/queue-status.enum.js";
import { ReasonCode } from "../enums/reason-code.enum.js";
export declare const REVIEW_QUEUE_ENTRY_SCHEMA_ID = "https://market-design-engine.dev/schemas/editorial/review-queue-entry.schema.json";
export declare const reviewQueueEntrySchema: {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/review-queue-entry.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publishable_candidate_id", "queue_status", "priority_level", "entered_queue_at", "assigned_reviewer_nullable", "queue_reason", "blocking_flags", "warnings"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rqe_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly publishable_candidate_id: {
            readonly type: "string";
            readonly pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly queue_status: {
            readonly type: "string";
            readonly enum: QueueStatus[];
        };
        readonly priority_level: {
            readonly type: "string";
            readonly enum: PriorityLevel[];
        };
        readonly entered_queue_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly assigned_reviewer_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
        readonly queue_reason: {
            readonly type: "string";
            readonly enum: ReasonCode[];
        };
        readonly blocking_flags: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "message", "path", "is_resolved"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly enum: ReasonCode[];
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly path: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly is_resolved: {
                        readonly type: "boolean";
                    };
                };
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "message", "path"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly enum: ReasonCode[];
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly path: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=review-queue-entry.schema.d.ts.map