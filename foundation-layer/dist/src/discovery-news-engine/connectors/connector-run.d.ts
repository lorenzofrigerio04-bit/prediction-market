import type { DiscoverySourceConnector } from "../interfaces/discovery-source-connector.js";
import type { DiscoveryNormalizationAdapter } from "../interfaces/discovery-normalization-adapter.js";
import type { DiscoveryFetchRequest } from "../entities/discovery-fetch-request.entity.js";
import type { DiscoveryConnectorRunResult } from "../entities/discovery-connector-run-result.entity.js";
/**
 * Runs connector fetch then normalizer; returns DiscoveryConnectorRunResult.
 * Handles fetch failure, invalid input (manual), parse/normalization errors, and empty payload (unsupported_shape).
 */
export declare function runConnectorWithNormalize(request: DiscoveryFetchRequest, connector: DiscoverySourceConnector, normalizer: DiscoveryNormalizationAdapter): Promise<DiscoveryConnectorRunResult>;
//# sourceMappingURL=connector-run.d.ts.map