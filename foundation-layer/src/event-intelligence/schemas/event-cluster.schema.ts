import { ClusterStatus } from "../clustering/enums/cluster-status.enum.js";

export const EVENT_CLUSTER_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/event-intelligence/event-cluster.schema.json";

export const eventClusterSchema = {
  $id: EVENT_CLUSTER_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "cluster_id",
    "candidate_ids",
    "similarity_scores",
    "cluster_confidence",
    "cluster_status",
  ],
  properties: {
    cluster_id: {
      $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventClusterId",
    },
    candidate_ids: {
      type: "array",
      minItems: 1,
      items: {
        $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId",
      },
    },
    similarity_scores: {
      type: "array",
      items: {
        $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/similarityScore",
      },
    },
    cluster_confidence: {
      $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
    },
    cluster_status: {
      type: "string",
      enum: Object.values(ClusterStatus),
    },
  },
} as const;
