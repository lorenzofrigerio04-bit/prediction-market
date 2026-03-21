import type { EventCandidateId, EventClusterId } from "../../value-objects/event-intelligence-ids.vo.js";
import type { SimilarityScore } from "../../value-objects/shared-domain.vo.js";
import { ClusterStatus } from "../enums/cluster-status.enum.js";
export type EventCluster = Readonly<{
    cluster_id: EventClusterId;
    candidate_ids: readonly EventCandidateId[];
    similarity_scores: readonly SimilarityScore[];
    cluster_confidence: number;
    cluster_status: ClusterStatus;
}>;
export declare const createEventCluster: (input: EventCluster) => EventCluster;
//# sourceMappingURL=event-cluster.entity.d.ts.map