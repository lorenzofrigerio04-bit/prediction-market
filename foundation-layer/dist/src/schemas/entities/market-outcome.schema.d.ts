import { CandidateOutcomeType } from "../../enums/candidate-outcome-type.enum.js";
export declare const MARKET_OUTCOME_SCHEMA_ID = "https://market-design-engine.dev/schemas/entities/market-outcome.schema.json";
export declare const marketOutcomeSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/entities/market-outcome.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "outcomeType", "label", "shortLabel", "description", "orderIndex", "probabilityHint", "entityVersion"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/outcomeId";
        };
        readonly outcomeType: {
            readonly type: "string";
            readonly enum: CandidateOutcomeType[];
        };
        readonly label: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly shortLabel: {
            readonly type: readonly ["string", "null"];
        };
        readonly description: {
            readonly type: readonly ["string", "null"];
        };
        readonly orderIndex: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly probabilityHint: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/value-objects/probability.schema.json";
            }, {
                readonly type: "null";
            }];
        };
        readonly entityVersion: {
            readonly type: "integer";
            readonly minimum: 1;
        };
    };
};
//# sourceMappingURL=market-outcome.schema.d.ts.map