import { createDiscoverySourceKey } from "../value-objects/discovery-source-key.vo.js";
import { feedConnector } from "../connectors/feed-connector.js";
import { feedNormalizationAdapter } from "../connectors/feed-normalizer.js";
export const gazzettaUfficialeSourceAdapter = {
    sourceKey: createDiscoverySourceKey("gazzetta-ufficiale"),
    connector: feedConnector,
    normalizer: feedNormalizationAdapter,
};
//# sourceMappingURL=gazzetta-ufficiale.adapter.js.map