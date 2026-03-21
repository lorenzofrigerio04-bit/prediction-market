/**
 * API passthrough connector: fetches JSON and returns raw response without shape validation.
 * Used by source adapters (e.g. ISTAT, INGV) whose API response shape is not articles/results/items/data.
 * Source-specific normalizers map the raw JSON to NormalizedDiscoveryPayload.
 */
import { createDiscoveryFetchedPayload } from "../entities/discovery-fetched-payload.entity.js";
import { createDiscoveryTransportMetadata } from "../entities/discovery-transport-metadata.entity.js";
import { createDiscoveryFetchFailure } from "../entities/discovery-fetch-failure.entity.js";
import { DiscoverySourceKind } from "../enums/discovery-source-kind.enum.js";
import { DiscoveryContentType } from "../enums/discovery-content-type.enum.js";
import { executeFetch } from "./fetch-helpers.js";
import { createTimestamp } from "../../value-objects/timestamp.vo.js";
export const apiPassthroughConnector = {
    canHandle(definition) {
        return definition.kind === DiscoverySourceKind.API;
    },
    async fetch(request) {
        const result = await executeFetch(request);
        if (!result.ok) {
            return { ok: false, failure: result.failure };
        }
        if (typeof result.body !== "object" || result.body === null) {
            return {
                ok: false,
                failure: createDiscoveryFetchFailure({
                    code: "PARSE_FAILURE",
                    message: "API passthrough connector expects JSON object body",
                    retryable: false,
                    detailsNullable: null,
                }),
            };
        }
        const raw = result.body;
        const payload = createDiscoveryFetchedPayload({
            raw,
            transportMetadata: createDiscoveryTransportMetadata({
                contentType: DiscoveryContentType.APPLICATION_JSON,
                fetchedAt: createTimestamp(result.fetchedAt),
                statusCodeNullable: result.statusCode,
                etagNullable: result.etag,
            }),
        });
        return { ok: true, payload };
    },
};
//# sourceMappingURL=api-passthrough-connector.js.map