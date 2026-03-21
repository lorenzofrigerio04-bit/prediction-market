import { ClusterStatus } from "../clustering/enums/cluster-status.enum.js";
export declare const EVENT_CLUSTER_SCHEMA_ID = "https://market-design-engine.dev/schemas/event-intelligence/event-cluster.schema.json";
export declare const eventClusterSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/event-cluster.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["cluster_id", "candidate_ids", "similarity_scores", "cluster_confidence", "cluster_status"];
    readonly properties: {
        readonly cluster_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventClusterId";
        };
        readonly candidate_ids: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId";
            };
        };
        readonly similarity_scores: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/similarityScore";
            };
        };
        readonly cluster_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly cluster_status: {
            readonly type: "string";
            readonly enum: ClusterStatus[];
        };
    };
};
//# sourceMappingURL=event-cluster.schema.d.ts.map