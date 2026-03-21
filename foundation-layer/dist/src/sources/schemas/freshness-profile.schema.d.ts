import { RecencyPriority } from "../enums/recency-priority.enum.js";
export declare const FRESHNESS_PROFILE_SCHEMA_ID = "https://market-design-engine.dev/schemas/sources/freshness-profile.schema.json";
export declare const freshnessProfileSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/sources/freshness-profile.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["expectedUpdateFrequency", "freshnessTtl", "recencyPriority"];
    readonly properties: {
        readonly expectedUpdateFrequency: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly freshnessTtl: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly recencyPriority: {
            readonly type: "string";
            readonly enum: RecencyPriority[];
        };
    };
};
//# sourceMappingURL=freshness-profile.schema.d.ts.map