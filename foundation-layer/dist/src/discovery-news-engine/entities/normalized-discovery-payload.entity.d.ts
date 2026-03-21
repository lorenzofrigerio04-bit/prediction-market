import type { DiscoverySourceId } from "../value-objects/discovery-source-id.vo.js";
import type { DiscoveryProvenanceMetadata } from "./discovery-provenance-metadata.entity.js";
import type { NormalizedDiscoveryItem } from "./normalized-discovery-item.entity.js";
export type NormalizedDiscoveryPayload = Readonly<{
    items: readonly NormalizedDiscoveryItem[];
    provenanceMetadata: DiscoveryProvenanceMetadata;
    sourceId: DiscoverySourceId;
}>;
export declare const createNormalizedDiscoveryPayload: (input: NormalizedDiscoveryPayload) => NormalizedDiscoveryPayload;
//# sourceMappingURL=normalized-discovery-payload.entity.d.ts.map