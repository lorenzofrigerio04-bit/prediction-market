import type { DiscoveryTransportMetadata } from "./discovery-transport-metadata.entity.js";
export type DiscoveryFetchedPayload = Readonly<{
    raw: Record<string, unknown>;
    transportMetadata: DiscoveryTransportMetadata;
}>;
export declare const createDiscoveryFetchedPayload: (input: DiscoveryFetchedPayload) => DiscoveryFetchedPayload;
//# sourceMappingURL=discovery-fetched-payload.entity.d.ts.map