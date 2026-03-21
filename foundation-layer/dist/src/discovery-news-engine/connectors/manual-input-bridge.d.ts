/**
 * Manual raw input bridge: accepts controlled manual/raw input, validates, returns DiscoveryFetchedPayload.
 * Use request.manualPayloadNullable with shape { items: Array<{ title/headline, url/link, ... }> } or single item.
 */
import type { DiscoverySourceConnector } from "../interfaces/discovery-source-connector.js";
export declare const manualInputBridgeConnector: DiscoverySourceConnector;
//# sourceMappingURL=manual-input-bridge.d.ts.map