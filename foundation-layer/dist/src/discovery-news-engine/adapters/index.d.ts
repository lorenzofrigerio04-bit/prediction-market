import type { DiscoverySourceAdapter } from "./source-adapter.types.js";
import type { DiscoverySourceKey } from "../value-objects/discovery-source-key.vo.js";
import { DiscoverySourceKind } from "../enums/discovery-source-kind.enum.js";
export type { DiscoverySourceAdapter } from "./source-adapter.types.js";
export { ansaRssSourceAdapter } from "./ansa-rss.adapter.js";
export { agiRssSourceAdapter } from "./agi-rss.adapter.js";
export { protezioneCivileRssSourceAdapter } from "./protezione-civile-rss.adapter.js";
export { gazzettaUfficialeSourceAdapter } from "./gazzetta-ufficiale.adapter.js";
export { istatSourceAdapter, istatNormalizationAdapter } from "./istat.adapter.js";
export { ingvSourceAdapter, ingvNormalizationAdapter } from "./ingv.adapter.js";
export { wikimediaPageviewsSourceAdapter, wikimediaPageviewsNormalizationAdapter, } from "./wikimedia-pageviews.adapter.js";
export { youtubeDataItSourceAdapter, youtubeDataItNormalizationAdapter, } from "./youtube-data-it.adapter.js";
export { googleTrendsItSourceAdapter, googleTrendsItNormalizationAdapter, } from "./google-trends-it.adapter.js";
export declare function getAdapterByKey(key: DiscoverySourceKey | string): DiscoverySourceAdapter | undefined;
export declare function getSupportedSourceKeys(): string[];
export declare function getAdaptersByKind(kind: DiscoverySourceKind): DiscoverySourceAdapter[];
//# sourceMappingURL=index.d.ts.map