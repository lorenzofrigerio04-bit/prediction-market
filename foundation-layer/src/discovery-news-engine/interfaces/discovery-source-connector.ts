import type { DiscoveryFetchRequest } from "../entities/discovery-fetch-request.entity.js";
import type { DiscoveryFetchResponse } from "../entities/discovery-fetch-response.entity.js";
import type { DiscoverySourceDefinition } from "../entities/discovery-source-definition.entity.js";

export interface DiscoverySourceConnector {
  canHandle(definition: DiscoverySourceDefinition): boolean;
  fetch(request: DiscoveryFetchRequest): Promise<DiscoveryFetchResponse>;
}
