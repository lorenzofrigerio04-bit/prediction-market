import { ContractSelectionStatus } from "../enums/contract-selection-status.enum.js";
export declare const CONTRACT_SELECTION_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-design/contract-selection.schema.json";
export declare const contractSelectionSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/contract-selection.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "canonical_event_id", "status", "selected_contract_type", "contract_type_reason", "selection_confidence", "rejected_contract_types", "selection_metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^csel_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly canonical_event_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: ContractSelectionStatus[];
        };
        readonly selected_contract_type: {
            readonly type: "string";
            readonly enum: readonly [import("../index.js").ContractType.BINARY, import("../index.js").ContractType.MULTI_OUTCOME, import("../index.js").ContractType.SCALAR_BRACKET];
        };
        readonly contract_type_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly selection_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly rejected_contract_types: {
            readonly type: "array";
            readonly uniqueItems: true;
            readonly items: {
                readonly type: "string";
                readonly enum: readonly [import("../index.js").ContractType.BINARY, import("../index.js").ContractType.MULTI_OUTCOME, import("../index.js").ContractType.SCALAR_BRACKET];
            };
        };
        readonly selection_metadata: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
    };
};
//# sourceMappingURL=contract-selection.schema.d.ts.map