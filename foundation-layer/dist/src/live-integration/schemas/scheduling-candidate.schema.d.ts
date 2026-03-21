import { EventPriority } from "../../enums/event-priority.enum.js";
import { ReadinessStatus } from "../enums/readiness-status.enum.js";
import { SchedulingStatus } from "../enums/scheduling-status.enum.js";
export declare const SCHEDULING_CANDIDATE_SCHEMA_ID = "https://market-design-engine.dev/schemas/live-integration/scheduling-candidate.schema.json";
export declare const schedulingCandidateSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/scheduling-candidate.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "publication_package_id", "scheduling_window", "priority_level", "scheduling_notes", "scheduling_status", "readiness_status", "delivery_readiness_report_id", "blocking_issues_snapshot"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^scnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly publication_package_id: {
            readonly type: "string";
            readonly pattern: "^ppkg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly scheduling_window: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["start_at", "end_at"];
            readonly properties: {
                readonly start_at: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
                readonly end_at: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
            };
        };
        readonly priority_level: {
            readonly type: "string";
            readonly enum: EventPriority[];
        };
        readonly scheduling_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly scheduling_status: {
            readonly type: "string";
            readonly enum: SchedulingStatus[];
        };
        readonly readiness_status: {
            readonly type: "string";
            readonly enum: ReadinessStatus[];
        };
        readonly delivery_readiness_report_id: {
            readonly anyOf: readonly [{
                readonly type: "string";
                readonly pattern: "^drrp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }, {
                readonly type: "null";
            }];
        };
        readonly blocking_issues_snapshot: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
};
//# sourceMappingURL=scheduling-candidate.schema.d.ts.map