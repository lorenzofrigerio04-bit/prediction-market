import { createDiscoverySourceKey } from "../value-objects/discovery-source-key.vo.js";
import { feedConnector } from "../connectors/feed-connector.js";
import { feedNormalizationAdapter } from "../connectors/feed-normalizer.js";
export const ansaRssSourceAdapter = {
    sourceKey: createDiscoverySourceKey("ansa-rss"),
    connector: feedConnector,
    normalizer: feedNormalizationAdapter,
};
//# sourceMappingURL=ansa-rss.adapter.js.map