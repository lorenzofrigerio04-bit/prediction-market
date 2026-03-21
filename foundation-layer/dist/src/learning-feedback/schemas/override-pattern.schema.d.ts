import { PatternStatus } from "../enums/pattern-status.enum.js";
import { OverrideType } from "../enums/override-type.enum.js";
export declare const OVERRIDE_PATTERN_SCHEMA_ID = "https://market-design-engine.dev/schemas/learning-feedback/override-pattern.schema.json";
export declare const overridePatternSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/override-pattern.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "status", "override_type", "supporting_refs"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lop_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: PatternStatus[];
        };
        readonly override_type: {
            readonly type: "string";
            readonly enum: OverrideType[];
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
//# sourceMappingURL=override-pattern.schema.d.ts.map