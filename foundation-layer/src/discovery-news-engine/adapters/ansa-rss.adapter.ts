import type { DiscoverySourceAdapter } from "./source-adapter.types.js";
import { createDiscoverySourceKey } from "../value-objects/discovery-source-key.vo.js";
import { feedConnector } from "../connectors/feed-connector.js";
import { feedNormalizationAdapter } from "../connectors/feed-normalizer.js";

export const ansaRssSourceAdapter: DiscoverySourceAdapter = {
  sourceKey: createDiscoverySourceKey("ansa-rss"),
  connector: feedConnector,
  normalizer: feedNormalizationAdapter,
};
