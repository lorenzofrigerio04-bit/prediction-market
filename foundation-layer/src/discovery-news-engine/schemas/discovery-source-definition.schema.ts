import { DiscoverySourceAuthMode } from "../enums/discovery-auth-mode.enum.js";
import { DiscoveryGeoScope } from "../enums/discovery-geo-scope.enum.js";
import { DiscoverySourceKind } from "../enums/discovery-source-kind.enum.js";
import { DiscoveryPollingHint } from "../enums/discovery-polling-hint.enum.js";
import { DiscoverySourceStatus } from "../enums/discovery-source-status.enum.js";
import { DiscoverySourceTier } from "../enums/discovery-source-tier.enum.js";
import { DiscoveryTopicScope } from "../enums/discovery-topic-scope.enum.js";
import { DiscoveryTrustTier } from "../enums/discovery-trust-tier.enum.js";
import { DiscoverySourceUsageRole } from "../enums/discovery-source-usage-role.enum.js";

export const DISCOVERY_SOURCE_DEFINITION_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/discovery/discovery-source-definition.schema.json";

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

export const discoverySourceDefinitionSchema = {
  $id: DISCOVERY_SOURCE_DEFINITION_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "key",
    "kind",
    "tier",
    "status",
    "pollingHint",
    "geoScope",
    "topicScope",
    "trustTier",
    "endpoint",
    "authMode",
    "sourceDefinitionIdNullable",
  ],
  properties: {
    id: {
      $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoverySourceId",
    },
    key: { type: "string", pattern: "^[a-z0-9][a-z0-9_-]{2,62}$" },
    kind: { type: "string", enum: Object.values(DiscoverySourceKind) },
    tier: { type: "string", enum: Object.values(DiscoverySourceTier) },
    status: { type: "string", enum: Object.values(DiscoverySourceStatus) },
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
    roleNullable: {
      oneOf: [
        { type: "string", enum: Object.values(DiscoverySourceUsageRole) },
        { type: "null" },
      ],
    },
  },
} as const;
