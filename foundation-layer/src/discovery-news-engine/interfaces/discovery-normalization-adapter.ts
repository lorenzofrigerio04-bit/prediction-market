import type { DiscoveryFetchedPayload } from "../entities/discovery-fetched-payload.entity.js";
import type { NormalizedDiscoveryPayload } from "../entities/normalized-discovery-payload.entity.js";
import type { DiscoverySourceDefinition } from "../entities/discovery-source-definition.entity.js";

export type DiscoveryNormalizationContext = Readonly<{
  sourceDefinition: DiscoverySourceDefinition;
  runIdNullable: string | null;
}>;

export interface DiscoveryNormalizationAdapter {
  normalize(
    payload: DiscoveryFetchedPayload,
    context: DiscoveryNormalizationContext,
  ): NormalizedDiscoveryPayload;
}
