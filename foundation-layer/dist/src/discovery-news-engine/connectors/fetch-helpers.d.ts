import type { DiscoveryFetchRequest } from "../entities/discovery-fetch-request.entity.js";
import type { DiscoveryFetchFailure } from "../entities/discovery-fetch-failure.entity.js";
import { DiscoveryContentType } from "../enums/discovery-content-type.enum.js";
export type ExecuteFetchSuccess = Readonly<{
    ok: true;
    body: string | Record<string, unknown>;
    contentType: string;
    statusCode: number;
    etag: string | null;
    fetchedAt: string;
}>;
export type ExecuteFetchError = Readonly<{
    ok: false;
    failure: DiscoveryFetchFailure;
}>;
export type ExecuteFetchResult = ExecuteFetchSuccess | ExecuteFetchError;
/**
 * Execute HTTP fetch for a discovery source. Uses endpoint from request.
 * Returns success with body (string for non-JSON, parsed object for application/json) and metadata,
 * or a structured failure that callers can map to DiscoveryFetchFailure / connector result.
 */
export declare function executeFetch(request: DiscoveryFetchRequest, options?: {
    timeoutMs?: number;
}): Promise<ExecuteFetchResult>;
/**
 * Infer discovery content type from response content-type header.
 * Used to choose parser (feed vs JSON).
 */
export declare function inferContentType(contentType: string): DiscoveryContentType | null;
//# sourceMappingURL=fetch-helpers.d.ts.map