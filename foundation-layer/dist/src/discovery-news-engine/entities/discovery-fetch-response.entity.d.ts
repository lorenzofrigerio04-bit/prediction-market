import type { DiscoveryFetchedPayload } from "./discovery-fetched-payload.entity.js";
import type { DiscoveryFetchFailure } from "./discovery-fetch-failure.entity.js";
export type DiscoveryFetchResponseSuccess = Readonly<{
    ok: true;
    payload: DiscoveryFetchedPayload;
}>;
export type DiscoveryFetchResponseFailure = Readonly<{
    ok: false;
    failure: DiscoveryFetchFailure;
}>;
export type DiscoveryFetchResponse = DiscoveryFetchResponseSuccess | DiscoveryFetchResponseFailure;
//# sourceMappingURL=discovery-fetch-response.entity.d.ts.map