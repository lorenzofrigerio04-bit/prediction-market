/**
 * INGV earthquake/open data source adapter.
 * Uses apiPassthroughConnector; normalizer maps INGV event JSON to NormalizedDiscoveryPayload.
 * Does not invent fields unsupported by the source shape.
 */
import type { DiscoveryNormalizationAdapter } from "../interfaces/discovery-normalization-adapter.js";
import type { DiscoverySourceAdapter } from "./source-adapter.types.js";
export declare const ingvNormalizationAdapter: DiscoveryNormalizationAdapter;
export declare const ingvSourceAdapter: DiscoverySourceAdapter;
//# sourceMappingURL=ingv.adapter.d.ts.map