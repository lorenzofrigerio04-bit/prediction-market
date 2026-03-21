import { ObservabilityEventType } from "../enums/observability-event-type.enum.js";
import { SeverityLevel } from "../enums/severity-level.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
export declare const OBSERVABILITY_EVENT_SCHEMA_ID = "https://market-design-engine.dev/schemas/reliability/observability-event.schema.json";
export declare const observabilityEventSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/reliability/observability-event.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "event_type", "module_name", "correlation_id", "emitted_at", "severity", "payload_summary", "trace_refs", "diagnostic_tags"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^obe_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly event_type: {
            readonly type: "string";
            readonly enum: ObservabilityEventType[];
        };
        readonly module_name: {
            readonly type: "string";
            readonly enum: TargetModule[];
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly emitted_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly severity: {
            readonly type: "string";
            readonly enum: SeverityLevel[];
        };
        readonly payload_summary: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["summary_type", "values"];
            readonly properties: {
                readonly summary_type: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly values: {
                    readonly type: "object";
                    readonly additionalProperties: {
                        readonly anyOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "number";
                        }, {
                            readonly type: "boolean";
                        }, {
                            readonly type: "null";
                        }];
                    };
                };
            };
        };
        readonly trace_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["trace_id", "span_id_nullable", "parent_trace_id_nullable"];
                readonly properties: {
                    readonly trace_id: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly span_id_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "string";
                            readonly minLength: 1;
                        }];
                    };
                    readonly parent_trace_id_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "string";
                            readonly minLength: 1;
                        }];
                    };
                };
            };
        };
        readonly diagnostic_tags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
};
//# sourceMappingURL=observability-event.schema.d.ts.map