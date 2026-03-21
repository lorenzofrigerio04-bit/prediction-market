import { discoveryRunDefinitionSchema } from "./discovery-run-definition.schema.js";
const discoveryScheduleHintDef = {
    type: "object",
    additionalProperties: false,
    required: ["cronExpressionNullable", "intervalSecondsNullable"],
    properties: {
        cronExpressionNullable: { oneOf: [{ type: "string" }, { type: "null" }] },
        intervalSecondsNullable: { oneOf: [{ type: "number" }, { type: "null" }] },
    },
};
export const DISCOVERY_JOB_DEFINITION_SCHEMA_ID = "https://market-design-engine.dev/schemas/discovery/discovery-job-definition.schema.json";
export const discoveryJobDefinitionSchema = {
    $id: DISCOVERY_JOB_DEFINITION_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "jobId",
        "runDefinition",
        "scheduleHint",
        "maxDurationSecondsNullable",
    ],
    properties: {
        jobId: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoveryJobId",
        },
        runDefinition: { $ref: discoveryRunDefinitionSchema.$id },
        scheduleHint: discoveryScheduleHintDef,
        maxDurationSecondsNullable: { oneOf: [{ type: "number" }, { type: "null" }] },
    },
};
//# sourceMappingURL=discovery-job-definition.schema.js.map