/**
 * API passthrough connector: fetches JSON and returns raw response without shape validation.
 * Used by source adapters (e.g. ISTAT, INGV) whose API response shape is not articles/results/items/data.
 * Source-specific normalizers map the raw JSON to NormalizedDiscoveryPayload.
 */
import type { DiscoverySourceConnector } from "../interfaces/discovery-source-connector.js";
export declare const apiPassthroughConnector: DiscoverySourceConnector;
//# sourceMappingURL=api-passthrough-connector.d.ts.map