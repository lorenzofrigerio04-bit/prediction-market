/**
 * ISTAT API / SDMX-compatible source adapter.
 * Uses apiPassthroughConnector; normalizer maps ISTAT/SDMX-like JSON to NormalizedDiscoveryPayload.
 * Does not invent fields unsupported by the source shape.
 */
import type { DiscoveryNormalizationAdapter } from "../interfaces/discovery-normalization-adapter.js";
import type { DiscoverySourceAdapter } from "./source-adapter.types.js";
export declare const istatNormalizationAdapter: DiscoveryNormalizationAdapter;
export declare const istatSourceAdapter: DiscoverySourceAdapter;
//# sourceMappingURL=istat.adapter.d.ts.map