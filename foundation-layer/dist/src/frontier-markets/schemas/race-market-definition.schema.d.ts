import { RaceValidationStatus } from "../enums/race-validation-status.enum.js";
import { WinningConditionType } from "../enums/winning-condition-type.enum.js";
export declare const RACE_MARKET_DEFINITION_SCHEMA_ID = "https://market-design-engine.dev/schemas/frontier-markets/race-market-definition.schema.json";
export declare const raceMarketDefinitionSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/race-market-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "parent_canonical_event_id_nullable", "race_targets", "winning_condition", "deadline_resolution", "source_hierarchy_selection", "race_validation_status", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^frc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly parent_canonical_event_id_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^cevt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
        readonly race_targets: {
            readonly type: "array";
            readonly minItems: 2;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/frontier-markets/race-target.schema.json";
            };
        };
        readonly winning_condition: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["type", "tie_break_policy"];
            readonly properties: {
                readonly type: {
                    readonly type: "string";
                    readonly enum: WinningConditionType.FIRST_TO_OCCUR[];
                };
                readonly tie_break_policy: {
                    readonly type: "string";
                    readonly enum: readonly ["none", "lowest_ordering_priority"];
                };
            };
        };
        readonly deadline_resolution: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/deadline-resolution.schema.json";
        };
        readonly source_hierarchy_selection: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/source-hierarchy-selection.schema.json";
        };
        readonly race_validation_status: {
            readonly type: "string";
            readonly enum: RaceValidationStatus[];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: readonly ["string", "number", "boolean", "null"];
            };
        };
    };
};
//# sourceMappingURL=race-market-definition.schema.d.ts.map