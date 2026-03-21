/**
 * JSON/API normalization: DiscoveryFetchedPayload (generic JSON with items array) → NormalizedDiscoveryPayload.
 * Supports top-level array or object with articles/results/items/data as array.
 * Generic field mapping: title, headline, url, link, publishedAt, pubDate, published_at, etc.
 */
import type { DiscoveryNormalizationAdapter, DiscoveryNormalizationContext } from "../interfaces/discovery-normalization-adapter.js";
import type { DiscoveryFetchedPayload } from "../entities/discovery-fetched-payload.entity.js";
import type { NormalizedDiscoveryPayload } from "../entities/normalized-discovery-payload.entity.js";
export declare function normalizeJsonApiPayload(payload: DiscoveryFetchedPayload, context: DiscoveryNormalizationContext): NormalizedDiscoveryPayload;
export declare const jsonApiNormalizationAdapter: DiscoveryNormalizationAdapter;
//# sourceMappingURL=json-api-normalizer.d.ts.map