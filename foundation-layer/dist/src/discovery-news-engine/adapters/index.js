import { createDiscoverySourceDefinition } from "../entities/discovery-source-definition.entity.js";
import { createDiscoverySourceId } from "../value-objects/discovery-source-id.vo.js";
import { createDiscoverySourceKey } from "../value-objects/discovery-source-key.vo.js";
import { createDiscoverySourceEndpoint } from "../entities/discovery-source-endpoint.entity.js";
import { DiscoverySourceTier } from "../enums/discovery-source-tier.enum.js";
import { DiscoverySourceStatus } from "../enums/discovery-source-status.enum.js";
import { DiscoveryPollingHint } from "../enums/discovery-polling-hint.enum.js";
import { DiscoveryGeoScope } from "../enums/discovery-geo-scope.enum.js";
import { DiscoveryTopicScope } from "../enums/discovery-topic-scope.enum.js";
import { DiscoveryTrustTier } from "../enums/discovery-trust-tier.enum.js";
import { DiscoverySourceAuthMode } from "../enums/discovery-auth-mode.enum.js";
import { ansaRssSourceAdapter } from "./ansa-rss.adapter.js";
import { agiRssSourceAdapter } from "./agi-rss.adapter.js";
import { protezioneCivileRssSourceAdapter } from "./protezione-civile-rss.adapter.js";
import { gazzettaUfficialeSourceAdapter } from "./gazzetta-ufficiale.adapter.js";
import { istatSourceAdapter } from "./istat.adapter.js";
import { ingvSourceAdapter } from "./ingv.adapter.js";
import { wikimediaPageviewsSourceAdapter } from "./wikimedia-pageviews.adapter.js";
import { youtubeDataItSourceAdapter } from "./youtube-data-it.adapter.js";
import { googleTrendsItSourceAdapter } from "./google-trends-it.adapter.js";
const DISCOVERY_SOURCE_ADAPTERS = [
    ansaRssSourceAdapter,
    agiRssSourceAdapter,
    protezioneCivileRssSourceAdapter,
    gazzettaUfficialeSourceAdapter,
    istatSourceAdapter,
    ingvSourceAdapter,
    wikimediaPageviewsSourceAdapter,
    youtubeDataItSourceAdapter,
    googleTrendsItSourceAdapter,
];
const adapterByKey = new Map(DISCOVERY_SOURCE_ADAPTERS.map((a) => [String(a.sourceKey), a]));
function dummyDefinition(kind) {
    return createDiscoverySourceDefinition({
        id: createDiscoverySourceId("dsrc_dummy_kind_check"),
        key: createDiscoverySourceKey("dummy"),
        kind,
        tier: DiscoverySourceTier.PRIMARY,
        status: DiscoverySourceStatus.ENABLED,
        pollingHint: DiscoveryPollingHint.INTERVAL,
        geoScope: DiscoveryGeoScope.IT,
        topicScope: DiscoveryTopicScope.GENERAL,
        trustTier: DiscoveryTrustTier.CURATED,
        endpoint: createDiscoverySourceEndpoint({ url: "https://example.com", method: "GET", headersNullable: null }),
        authMode: DiscoverySourceAuthMode.NONE,
        sourceDefinitionIdNullable: null,
        roleNullable: null,
    });
}
export { ansaRssSourceAdapter } from "./ansa-rss.adapter.js";
export { agiRssSourceAdapter } from "./agi-rss.adapter.js";
export { protezioneCivileRssSourceAdapter } from "./protezione-civile-rss.adapter.js";
export { gazzettaUfficialeSourceAdapter } from "./gazzetta-ufficiale.adapter.js";
export { istatSourceAdapter, istatNormalizationAdapter } from "./istat.adapter.js";
export { ingvSourceAdapter, ingvNormalizationAdapter } from "./ingv.adapter.js";
export { wikimediaPageviewsSourceAdapter, wikimediaPageviewsNormalizationAdapter, } from "./wikimedia-pageviews.adapter.js";
export { youtubeDataItSourceAdapter, youtubeDataItNormalizationAdapter, } from "./youtube-data-it.adapter.js";
export { googleTrendsItSourceAdapter, googleTrendsItNormalizationAdapter, } from "./google-trends-it.adapter.js";
export function getAdapterByKey(key) {
    return adapterByKey.get(String(key));
}
export function getSupportedSourceKeys() {
    return DISCOVERY_SOURCE_ADAPTERS.map((a) => String(a.sourceKey));
}
export function getAdaptersByKind(kind) {
    const def = dummyDefinition(kind);
    return DISCOVERY_SOURCE_ADAPTERS.filter((a) => a.connector.canHandle(def));
}
//# sourceMappingURL=index.js.map