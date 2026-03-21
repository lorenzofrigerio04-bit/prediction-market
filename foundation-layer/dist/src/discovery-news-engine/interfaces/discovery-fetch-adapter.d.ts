import type { DiscoveryFetchRequest } from "../entities/discovery-fetch-request.entity.js";
import type { DiscoveryFetchResponse } from "../entities/discovery-fetch-response.entity.js";
export interface DiscoveryFetchAdapter {
    fetch(request: DiscoveryFetchRequest): Promise<DiscoveryFetchResponse>;
}
//# sourceMappingURL=discovery-fetch-adapter.d.ts.map