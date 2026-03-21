import { normalizedDiscoveryItemSchema } from "./normalized-discovery-item.schema.js";
import { discoveryProvenanceMetadataSchema } from "./discovery-provenance-metadata.schema.js";

export const NORMALIZED_DISCOVERY_PAYLOAD_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/discovery/normalized-discovery-payload.schema.json";

export const normalizedDiscoveryPayloadSchema = {
  $id: NORMALIZED_DISCOVERY_PAYLOAD_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["items", "provenanceMetadata", "sourceId"],
  properties: {
    items: {
      type: "array",
      minItems: 1,
      items: { $ref: normalizedDiscoveryItemSchema.$id },
    },
    provenanceMetadata: { $ref: discoveryProvenanceMetadataSchema.$id },
    sourceId: {
      $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoverySourceId",
    },
  },
} as const;
