import { RaceValidationStatus } from "../enums/race-validation-status.enum.js";
import { WinningConditionType } from "../enums/winning-condition-type.enum.js";
export const RACE_MARKET_DEFINITION_SCHEMA_ID = "https://market-design-engine.dev/schemas/frontier-markets/race-market-definition.schema.json";
export const raceMarketDefinitionSchema = {
    $id: RACE_MARKET_DEFINITION_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "parent_canonical_event_id_nullable",
        "race_targets",
        "winning_condition",
        "deadline_resolution",
        "source_hierarchy_selection",
        "race_validation_status",
        "metadata",
    ],
    properties: {
        id: { type: "string", pattern: "^frc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "integer", minimum: 1 },
        parent_canonical_event_id_nullable: {
            anyOf: [
                { type: "null" },
                { type: "string", pattern: "^cevt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
            ],
        },
        race_targets: {
            type: "array",
            minItems: 2,
            items: {
                $ref: "https://market-design-engine.dev/schemas/frontier-markets/race-target.schema.json",
            },
        },
        winning_condition: {
            type: "object",
            additionalProperties: false,
            required: ["type", "tie_break_policy"],
            properties: {
                type: { type: "string", enum: Object.values(WinningConditionType) },
                tie_break_policy: { type: "string", enum: ["none", "lowest_ordering_priority"] },
            },
        },
        deadline_resolution: {
            $ref: "https://market-design-engine.dev/schemas/market-design/deadline-resolution.schema.json",
        },
        source_hierarchy_selection: {
            $ref: "https://market-design-engine.dev/schemas/market-design/source-hierarchy-selection.schema.json",
        },
        race_validation_status: { type: "string", enum: Object.values(RaceValidationStatus) },
        metadata: {
            type: "object",
            additionalProperties: {
                type: ["string", "number", "boolean", "null"],
            },
        },
    },
};
//# sourceMappingURL=race-market-definition.schema.js.map