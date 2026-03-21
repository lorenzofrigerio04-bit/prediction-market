import { AggregationStatus } from "../enums/aggregation-status.enum.js";
export declare const LEARNING_AGGREGATION_SCHEMA_ID = "https://market-design-engine.dev/schemas/learning-feedback/learning-aggregation.schema.json";
export declare const learningAggregationSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/learning-aggregation.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "correlation_id", "aggregation_status", "input_signal_refs", "aggregated_insight_refs", "generated_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lag_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly aggregation_status: {
            readonly type: "string";
            readonly enum: AggregationStatus[];
        };
        readonly input_signal_refs: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly aggregated_insight_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly generated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
};
//# sourceMappingURL=learning-aggregation.schema.d.ts.map