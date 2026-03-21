import { PatternStatus } from "../enums/pattern-status.enum.js";
export declare const REJECTION_PATTERN_SCHEMA_ID = "https://market-design-engine.dev/schemas/learning-feedback/rejection-pattern.schema.json";
export declare const rejectionPatternSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/rejection-pattern.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "status", "reason_codes", "supporting_refs"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lrp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: PatternStatus[];
        };
        readonly reason_codes: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly supporting_refs: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
};
//# sourceMappingURL=rejection-pattern.schema.d.ts.map