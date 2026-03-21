import type { EventCandidate } from "../../candidates/entities/event-candidate.entity.js";
import type { EventCluster } from "../entities/event-cluster.entity.js";
export interface EventClusterer {
    cluster(candidates: readonly EventCandidate[]): readonly EventCluster[];
}
//# sourceMappingURL=event-clusterer.d.ts.map