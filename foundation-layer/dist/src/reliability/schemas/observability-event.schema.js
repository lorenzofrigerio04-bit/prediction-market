import { ObservabilityEventType } from "../enums/observability-event-type.enum.js";
import { SeverityLevel } from "../enums/severity-level.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
export const OBSERVABILITY_EVENT_SCHEMA_ID = "https://market-design-engine.dev/schemas/reliability/observability-event.schema.json";
export const observabilityEventSchema = {
    $id: OBSERVABILITY_EVENT_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "event_type",
        "module_name",
        "correlation_id",
        "emitted_at",
        "severity",
        "payload_summary",
        "trace_refs",
        "diagnostic_tags",
    ],
    properties: {
        id: { type: "string", pattern: "^obe_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "integer", minimum: 1 },
        event_type: { type: "string", enum: Object.values(ObservabilityEventType) },
        module_name: { type: "string", enum: Object.values(TargetModule) },
        correlation_id: { type: "string", pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        emitted_at: { type: "string", format: "date-time" },
        severity: { type: "string", enum: Object.values(SeverityLevel) },
        payload_summary: {
            type: "object",
            additionalProperties: false,
            required: ["summary_type", "values"],
            properties: {
                summary_type: { type: "string", minLength: 1 },
                values: {
                    type: "object",
                    additionalProperties: {
                        anyOf: [{ type: "string" }, { type: "number" }, { type: "boolean" }, { type: "null" }],
                    },
                },
            },
        },
        trace_refs: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["trace_id", "span_id_nullable", "parent_trace_id_nullable"],
                properties: {
                    trace_id: { type: "string", minLength: 1 },
                    span_id_nullable: { anyOf: [{ type: "null" }, { type: "string", minLength: 1 }] },
                    parent_trace_id_nullable: { anyOf: [{ type: "null" }, { type: "string", minLength: 1 }] },
                },
            },
        },
        diagnostic_tags: { type: "array", items: { type: "string", minLength: 1 } },
    },
};
//# sourceMappingURL=observability-event.schema.js.map