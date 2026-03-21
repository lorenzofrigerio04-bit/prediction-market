import type { DiscoveryStoryClusterId } from "../value-objects/discovery-story-cluster-id.vo.js";
import type { DiscoverySignalId } from "../value-objects/discovery-signal-id.vo.js";
import type { NormalizedExternalItemId } from "../value-objects/discovery-signal-evidence-ref.vo.js";
export type EventLeadEvidenceSet = Readonly<{
    clusterId: DiscoveryStoryClusterId;
    memberItemIds: readonly NormalizedExternalItemId[];
    memberSignalIds?: readonly DiscoverySignalId[];
    representativeHeadlineNullable: string | null;
}>;
export declare const createEventLeadEvidenceSet: (input: EventLeadEvidenceSet) => EventLeadEvidenceSet;
//# sourceMappingURL=event-lead-evidence-set.entity.d.ts.map