/**
 * YouTube Data API (Italy) adapter.
 * Uses apiPassthroughConnector; normalizer maps search/list or videos/list JSON to NormalizedDiscoveryPayload.
 * Region-awareness from catalog (geoScope IT); no inference of unsupported fields.
 */
import type { DiscoveryNormalizationAdapter } from "../interfaces/discovery-normalization-adapter.js";
import type { DiscoverySourceAdapter } from "./source-adapter.types.js";
export declare const youtubeDataItNormalizationAdapter: DiscoveryNormalizationAdapter;
export declare const youtubeDataItSourceAdapter: DiscoverySourceAdapter;
//# sourceMappingURL=youtube-data-it.adapter.d.ts.map