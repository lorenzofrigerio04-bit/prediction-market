/**
 * Wikimedia Pageviews API adapter.
 * Uses apiPassthroughConnector; normalizer maps pageview JSON to NormalizedDiscoveryPayload.
 * Attention signal only; no ranking or scoring.
 */
import type { DiscoveryNormalizationAdapter } from "../interfaces/discovery-normalization-adapter.js";
import type { DiscoverySourceAdapter } from "./source-adapter.types.js";
export declare const wikimediaPageviewsNormalizationAdapter: DiscoveryNormalizationAdapter;
export declare const wikimediaPageviewsSourceAdapter: DiscoverySourceAdapter;
//# sourceMappingURL=wikimedia-pageviews.adapter.d.ts.map