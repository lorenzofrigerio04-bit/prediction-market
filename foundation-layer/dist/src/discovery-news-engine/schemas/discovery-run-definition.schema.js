import { DiscoveryRunTrigger } from "../enums/discovery-run-trigger.enum.js";
const discoveryScheduleHintDef = {
    type: "object",
    additionalProperties: false,
    required: ["cronExpressionNullable", "intervalSecondsNullable"],
    properties: {
        cronExpressionNullable: { oneOf: [{ type: "string" }, { type: "null" }] },
        intervalSecondsNullable: { oneOf: [{ type: "number" }, { type: "null" }] },
    },
};
const discoveryExecutionWindowDef = {
    type: "object",
    additionalProperties: false,
    required: ["start", "end"],
    properties: {
        start: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp",
        },
        end: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp",
        },
    },
};
export const DISCOVERY_RUN_DEFINITION_SCHEMA_ID = "https://market-design-engine.dev/schemas/discovery/discovery-run-definition.schema.json";
export const discoveryRunDefinitionSchema = {
    $id: DISCOVERY_RUN_DEFINITION_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "runId",
        "sourceIds",
        "trigger",
        "scheduleHintNullable",
        "executionWindowNullable",
    ],
    properties: {
        runId: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoveryRunId",
        },
        sourceIds: {
            type: "array",
            minItems: 1,
            items: {
                $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoverySourceId",
            },
        },
        trigger: { type: "string", enum: Object.values(DiscoveryRunTrigger) },
        scheduleHintNullable: {
            oneOf: [discoveryScheduleHintDef, { type: "null" }],
        },
        executionWindowNullable: {
            oneOf: [discoveryExecutionWindowDef, { type: "null" }],
        },
    },
};
//# sourceMappingURL=discovery-run-definition.schema.js.map