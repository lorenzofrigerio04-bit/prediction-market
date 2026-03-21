import { DerivativeType } from "../enums/derivative-type.enum.js";
export declare const DERIVATIVE_MARKET_DEFINITION_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-expansion/derivative-market-definition.schema.json";
export declare const derivativeMarketDefinitionSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/derivative-market-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "parent_family_id", "source_relation_ref", "market_ref", "derivative_type", "dependency_strength", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mdd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly parent_family_id: {
            readonly type: "string";
            readonly pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly source_relation_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly market_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly derivative_type: {
            readonly type: "string";
            readonly enum: DerivativeType[];
        };
        readonly dependency_strength: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 1;
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
};
//# sourceMappingURL=derivative-market-definition.schema.d.ts.map