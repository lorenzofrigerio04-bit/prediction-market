/**
 * Google Trends Italy adapter (experimental / optional).
 * Uses apiPassthroughConnector; normalizer maps trend/query JSON to NormalizedDiscoveryPayload.
 * Supports degraded behavior when payload is empty or missing required keys; no live dependency in tests.
 */
import type { DiscoveryNormalizationAdapter } from "../interfaces/discovery-normalization-adapter.js";
import type { DiscoverySourceAdapter } from "./source-adapter.types.js";
export declare const googleTrendsItNormalizationAdapter: DiscoveryNormalizationAdapter;
export declare const googleTrendsItSourceAdapter: DiscoverySourceAdapter;
//# sourceMappingURL=google-trends-it.adapter.d.ts.map