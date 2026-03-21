import { DiscoveryGeoScope } from "../enums/discovery-geo-scope.enum.js";
import { DiscoveryTopicScope } from "../enums/discovery-topic-scope.enum.js";

const normalizedSourceReferenceDef = {
  type: "object",
  additionalProperties: false,
  required: ["sourceId", "locator"],
  properties: {
    sourceId: {
      $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoverySourceId",
    },
    locator: { type: "string", minLength: 1 },
    labelNullable: { oneOf: [{ type: "string" }, { type: "null" }] },
    sourceKeyNullable: {
      oneOf: [{ type: "string", pattern: "^[a-z0-9][a-z0-9_-]{2,62}$" }, { type: "null" }],
    },
  },
};

const discoveryObservedMetricsDef = {
  type: "object",
  additionalProperties: false,
  properties: {
    pageviewsNullable: { type: "number" },
    timeframeNullable: { type: "string" },
    regionNullable: { type: "string" },
    channelIdNullable: { type: "string" },
  },
};

export const NORMALIZED_DISCOVERY_ITEM_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/discovery/normalized-discovery-item.schema.json";

export const normalizedDiscoveryItemSchema = {
  $id: NORMALIZED_DISCOVERY_ITEM_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "headline",
    "bodySnippetNullable",
    "canonicalUrl",
    "externalItemId",
    "publishedAt",
    "publishedAtPresent",
    "sourceReference",
    "geoSignalNullable",
    "geoPlaceTextNullable",
    "topicSignalNullable",
    "languageCode",
    "observedMetricsNullable",
  ],
  properties: {
    headline: { type: "string", minLength: 1 },
    bodySnippetNullable: { oneOf: [{ type: "string" }, { type: "null" }] },
    canonicalUrl: { type: "string", minLength: 1 },
    externalItemId: { type: "string", minLength: 1 },
    publishedAt: {
      $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp",
    },
    publishedAtPresent: { type: "boolean" },
    sourceReference: normalizedSourceReferenceDef,
    geoSignalNullable: {
      oneOf: [
        { type: "string", enum: Object.values(DiscoveryGeoScope) },
        { type: "null" },
      ],
    },
    geoPlaceTextNullable: { oneOf: [{ type: "string" }, { type: "null" }] },
    topicSignalNullable: {
      oneOf: [
        { type: "string", enum: Object.values(DiscoveryTopicScope) },
        { type: "null" },
      ],
    },
    languageCode: {
      $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/languageCode",
    },
    observedMetricsNullable: {
      oneOf: [discoveryObservedMetricsDef, { type: "null" }],
    },
  },
} as const;
