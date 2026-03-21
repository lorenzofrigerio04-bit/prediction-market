import { StrategyType } from "../enums/strategy-type.enum.js";
import { ContractType } from "../../market-design/enums/contract-type.enum.js";
export declare const EXPANSION_STRATEGY_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-expansion/expansion-strategy.schema.json";
export declare const expansionStrategySchema: {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/expansion-strategy.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "source_context_ref", "strategy_type", "allowed_contract_types", "max_satellite_count", "max_derivative_count", "anti_cannibalization_policy", "expansion_notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mes_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly source_context_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly strategy_type: {
            readonly type: "string";
            readonly enum: StrategyType[];
        };
        readonly allowed_contract_types: {
            readonly type: "array";
            readonly minItems: 1;
            readonly uniqueItems: true;
            readonly items: {
                readonly type: "string";
                readonly enum: ContractType[];
            };
        };
        readonly max_satellite_count: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly max_derivative_count: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly anti_cannibalization_policy: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly expansion_notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly minLength: 1;
            }];
        };
    };
};
//# sourceMappingURL=expansion-strategy.schema.d.ts.map