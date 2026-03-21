import { DiscoverySourceTier } from "../enums/discovery-source-tier.enum.js";
import { DiscoverySourceUsageRole } from "../enums/discovery-source-usage-role.enum.js";
import { DiscoveryTrustTier } from "../enums/discovery-trust-tier.enum.js";
const discoveryFetchMetadataDef = {
    type: "object",
    additionalProperties: false,
    properties: {
        statusCodeNullable: { oneOf: [{ type: "number" }, { type: "null" }] },
        etagNullable: { oneOf: [{ type: "string" }, { type: "null" }] },
    },
};
export const DISCOVERY_PROVENANCE_METADATA_SCHEMA_ID = "https://market-design-engine.dev/schemas/discovery/discovery-provenance-metadata.schema.json";
export const discoveryProvenanceMetadataSchema = {
    $id: DISCOVERY_PROVENANCE_METADATA_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "fetchedAt",
        "sourceDefinitionId",
        "runIdNullable",
        "sourceKey",
        "sourceRoleNullable",
        "sourceTier",
        "trustTier",
        "endpointReferenceNullable",
        "adapterKeyNullable",
        "fetchMetadataNullable",
    ],
    properties: {
        fetchedAt: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp",
        },
        sourceDefinitionId: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoverySourceId",
        },
        runIdNullable: {
            oneOf: [
                {
                    $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoveryRunId",
                },
                { type: "null" },
            ],
        },
        sourceKey: { type: "string", pattern: "^[a-z0-9][a-z0-9_-]{2,62}$" },
        sourceRoleNullable: {
            oneOf: [
                { type: "string", enum: Object.values(DiscoverySourceUsageRole) },
                { type: "null" },
            ],
        },
        sourceTier: { type: "string", enum: Object.values(DiscoverySourceTier) },
        trustTier: { type: "string", enum: Object.values(DiscoveryTrustTier) },
        endpointReferenceNullable: { oneOf: [{ type: "string" }, { type: "null" }] },
        adapterKeyNullable: { oneOf: [{ type: "string" }, { type: "null" }] },
        fetchMetadataNullable: {
            oneOf: [discoveryFetchMetadataDef, { type: "null" }],
        },
    },
};
//# sourceMappingURL=discovery-provenance-metadata.schema.js.map