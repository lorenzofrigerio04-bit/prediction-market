import { CounterType } from "../enums/counter-type.enum.js";
import { MeasurementWindowUnit } from "../enums/measurement-window-unit.enum.js";
export declare const USAGE_COUNTER_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/usage-counter.schema.json";
export declare const usageCounterSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/usage-counter.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "owner_ref", "counter_type", "measured_value", "measurement_window", "updated_at", "consistency_notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vuc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly owner_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly counter_type: {
            readonly type: "string";
            readonly enum: CounterType[];
        };
        readonly measured_value: {
            readonly type: "number";
        };
        readonly measurement_window: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["unit", "size"];
            readonly properties: {
                readonly unit: {
                    readonly type: "string";
                    readonly enum: MeasurementWindowUnit[];
                };
                readonly size: {
                    readonly type: "integer";
                    readonly minimum: 1;
                };
            };
        };
        readonly updated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly consistency_notes_nullable: {
            readonly type: readonly ["string", "null"];
        };
    };
};
//# sourceMappingURL=usage-counter.schema.d.ts.map