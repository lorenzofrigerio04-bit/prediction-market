/**
 * Feed normalization: DiscoveryFetchedPayload (raw RSS/Atom-like shape) → NormalizedDiscoveryPayload.
 * Parsed feed raw shape: { items: Array<{ link, title, pubDate?, description?, content?, guid? }>, feedTitle? }.
 * Adapted from lib/ingestion/fetchers/rss.ts item shape; output is engine NormalizedDiscoveryPayload.
 */
import type { DiscoveryNormalizationAdapter } from "../interfaces/discovery-normalization-adapter.js";
import type { DiscoveryFetchedPayload } from "../entities/discovery-fetched-payload.entity.js";
import type { DiscoveryNormalizationContext } from "../interfaces/discovery-normalization-adapter.js";
import type { NormalizedDiscoveryPayload } from "../entities/normalized-discovery-payload.entity.js";
export declare function normalizeFeedPayload(payload: DiscoveryFetchedPayload, context: DiscoveryNormalizationContext): NormalizedDiscoveryPayload;
export declare const feedNormalizationAdapter: DiscoveryNormalizationAdapter;
//# sourceMappingURL=feed-normalizer.d.ts.map