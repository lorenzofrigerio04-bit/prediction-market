import { DiscoverySourceAuthMode } from "../enums/discovery-auth-mode.enum.js";
import { DiscoverySourceCapability } from "../enums/discovery-source-capability.enum.js";
import { DiscoveryGeoScope } from "../enums/discovery-geo-scope.enum.js";
import { DiscoverySourceKind } from "../enums/discovery-source-kind.enum.js";
import { DiscoveryPollingHint } from "../enums/discovery-polling-hint.enum.js";
import { DiscoverySourceStatus } from "../enums/discovery-source-status.enum.js";
import { DiscoverySourceTier } from "../enums/discovery-source-tier.enum.js";
import { DiscoveryTopicScope } from "../enums/discovery-topic-scope.enum.js";
import { DiscoveryTrustTier } from "../enums/discovery-trust-tier.enum.js";
import { DiscoverySourceUsageRole } from "../enums/discovery-source-usage-role.enum.js";
export const DISCOVERY_SOURCE_CATALOG_ENTRY_SCHEMA_ID = "https://market-design-engine.dev/schemas/discovery/discovery-source-catalog-entry.schema.json";
const discoverySourceEndpointDef = {
    type: "object",
    additionalProperties: false,
    required: ["url", "method"],
    properties: {
        url: { type: "string", minLength: 1 },
        method: { type: "string", minLength: 1 },
        headersNullable: {
            oneOf: [
                { type: "object", additionalProperties: { type: "string" } },
                { type: "null" },
            ],
        },
    },
};
const discoveryScheduleHintDef = {
    type: "object",
    additionalProperties: false,
    required: ["cronExpressionNullable", "intervalSecondsNullable"],
    properties: {
        cronExpressionNullable: { oneOf: [{ type: "string" }, { type: "null" }] },
        intervalSecondsNullable: { oneOf: [{ type: "integer", minimum: 0 }, { type: "null" }] },
    },
};
export const discoverySourceCatalogEntrySchema = {
    $id: DISCOVERY_SOURCE_CATALOG_ENTRY_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "key",
        "name",
        "kind",
        "tier",
        "status",
        "role",
        "pollingHint",
        "geoScope",
        "topicScope",
        "trustTier",
        "endpoint",
        "authMode",
        "sourceDefinitionIdNullable",
        "scheduleHint",
        "descriptionNullable",
        "capabilities",
    ],
    properties: {
        id: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoverySourceId",
        },
        key: { type: "string", pattern: "^[a-z0-9][a-z0-9_-]{2,62}$" },
        name: { type: "string", minLength: 1 },
        kind: { type: "string", enum: Object.values(DiscoverySourceKind) },
        tier: { type: "string", enum: Object.values(DiscoverySourceTier) },
        status: { type: "string", enum: Object.values(DiscoverySourceStatus) },
        role: { type: "string", enum: Object.values(DiscoverySourceUsageRole) },
        pollingHint: { type: "string", enum: Object.values(DiscoveryPollingHint) },
        geoScope: { type: "string", enum: Object.values(DiscoveryGeoScope) },
        topicScope: { type: "string", enum: Object.values(DiscoveryTopicScope) },
        trustTier: { type: "string", enum: Object.values(DiscoveryTrustTier) },
        endpoint: discoverySourceEndpointDef,
        authMode: { type: "string", enum: Object.values(DiscoverySourceAuthMode) },
        sourceDefinitionIdNullable: {
            oneOf: [
                {
                    $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceDefinitionId",
                },
                { type: "null" },
            ],
        },
        scheduleHint: discoveryScheduleHintDef,
        descriptionNullable: { oneOf: [{ type: "string" }, { type: "null" }] },
        capabilities: {
            type: "array",
            items: { type: "string", enum: Object.values(DiscoverySourceCapability) },
            minItems: 0,
        },
    },
};
//# sourceMappingURL=discovery-source-catalog-entry.schema.js.map