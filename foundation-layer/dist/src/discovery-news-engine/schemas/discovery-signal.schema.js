import { DiscoverySignalFreshnessClass } from "../enums/discovery-signal-freshness-class.enum.js";
import { DiscoverySignalKind } from "../enums/discovery-signal-kind.enum.js";
import { DiscoverySignalPriorityHint } from "../enums/discovery-signal-priority-hint.enum.js";
import { DiscoverySignalStatus } from "../enums/discovery-signal-status.enum.js";
import { DiscoveryEvidenceRole } from "../enums/discovery-evidence-role.enum.js";
const discoverySignalEvidenceRefDef = {
    type: "object",
    additionalProperties: false,
    required: ["itemId", "role"],
    properties: {
        itemId: { type: "string", minLength: 1 },
        role: { type: "string", enum: Object.values(DiscoveryEvidenceRole) },
    },
};
const discoverySignalTimeWindowDef = {
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
const discoverySignalPayloadRefDef = {
    type: "object",
    additionalProperties: false,
    required: ["normalizedItemId"],
    properties: {
        normalizedItemId: { type: "string", minLength: 1 },
    },
};
export const DISCOVERY_SIGNAL_SCHEMA_ID = "https://market-design-engine.dev/schemas/discovery/discovery-signal.schema.json";
export const discoverySignalSchema = {
    $id: DISCOVERY_SIGNAL_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "kind",
        "payloadRef",
        "timeWindow",
        "freshnessClass",
        "priorityHint",
        "status",
        "evidenceRefs",
        "provenanceMetadata",
        "createdAt",
    ],
    properties: {
        id: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoverySignalId",
        },
        kind: { type: "string", enum: Object.values(DiscoverySignalKind) },
        payloadRef: discoverySignalPayloadRefDef,
        timeWindow: discoverySignalTimeWindowDef,
        freshnessClass: {
            type: "string",
            enum: Object.values(DiscoverySignalFreshnessClass),
        },
        priorityHint: {
            type: "string",
            enum: Object.values(DiscoverySignalPriorityHint),
        },
        status: { type: "string", enum: Object.values(DiscoverySignalStatus) },
        evidenceRefs: {
            type: "array",
            items: discoverySignalEvidenceRefDef,
        },
        provenanceMetadata: {
            $ref: "https://market-design-engine.dev/schemas/discovery/discovery-provenance-metadata.schema.json",
        },
        createdAt: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp",
        },
    },
};
//# sourceMappingURL=discovery-signal.schema.js.map