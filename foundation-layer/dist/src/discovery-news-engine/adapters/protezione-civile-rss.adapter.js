import { createDiscoverySourceKey } from "../value-objects/discovery-source-key.vo.js";
import { feedConnector } from "../connectors/feed-connector.js";
import { feedNormalizationAdapter } from "../connectors/feed-normalizer.js";
export const protezioneCivileRssSourceAdapter = {
    sourceKey: createDiscoverySourceKey("protezione-civile-rss"),
    connector: feedConnector,
    normalizer: feedNormalizationAdapter,
};
//# sourceMappingURL=protezione-civile-rss.adapter.js.map