import { CompletionPolicy } from "../enums/completion-policy.enum.js";
import { RequiredOrderPolicy } from "../enums/required-order-policy.enum.js";
import { SequenceValidationStatus } from "../enums/sequence-validation-status.enum.js";
export declare const SEQUENCE_MARKET_DEFINITION_SCHEMA_ID = "https://market-design-engine.dev/schemas/frontier-markets/sequence-market-definition.schema.json";
export declare const sequenceMarketDefinitionSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/sequence-market-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "parent_event_graph_context_id", "sequence_targets", "required_order_policy", "completion_policy", "deadline_resolution", "sequence_validation_status", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^fse_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly parent_event_graph_context_id: {
            readonly type: "string";
            readonly pattern: "^egnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly sequence_targets: {
            readonly type: "array";
            readonly minItems: 2;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/frontier-markets/sequence-target.schema.json";
            };
        };
        readonly required_order_policy: {
            readonly type: "string";
            readonly enum: RequiredOrderPolicy[];
        };
        readonly completion_policy: {
            readonly type: "string";
            readonly enum: CompletionPolicy[];
        };
        readonly deadline_resolution: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/deadline-resolution.schema.json";
        };
        readonly sequence_validation_status: {
            readonly type: "string";
            readonly enum: SequenceValidationStatus[];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: readonly ["string", "number", "boolean", "null"];
            };
        };
    };
};
//# sourceMappingURL=sequence-market-definition.schema.d.ts.map