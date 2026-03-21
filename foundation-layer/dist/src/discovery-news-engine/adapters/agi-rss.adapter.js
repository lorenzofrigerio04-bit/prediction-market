import { createDiscoverySourceKey } from "../value-objects/discovery-source-key.vo.js";
import { feedConnector } from "../connectors/feed-connector.js";
import { feedNormalizationAdapter } from "../connectors/feed-normalizer.js";
export const agiRssSourceAdapter = {
    sourceKey: createDiscoverySourceKey("agi-rss"),
    connector: feedConnector,
    normalizer: feedNormalizationAdapter,
};
//# sourceMappingURL=agi-rss.adapter.js.map