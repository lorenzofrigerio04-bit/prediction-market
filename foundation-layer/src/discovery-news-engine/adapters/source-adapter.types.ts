import type { DiscoverySourceConnector } from "../interfaces/discovery-source-connector.js";
import type { DiscoveryNormalizationAdapter } from "../interfaces/discovery-normalization-adapter.js";
import type { DiscoverySourceKey } from "../value-objects/discovery-source-key.vo.js";

/**
 * Source adapter: binds a catalog source key to connector + normalizer.
 * Used by the discovery engine to run fetch + normalize per source without hardcoding in connectors.
 */
export type DiscoverySourceAdapter = Readonly<{
  sourceKey: DiscoverySourceKey;
  connector: DiscoverySourceConnector;
  normalizer: DiscoveryNormalizationAdapter;
}>;
