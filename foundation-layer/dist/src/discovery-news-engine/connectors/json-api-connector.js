/**
 * Structured HTTP JSON/API connector.
 * Fetches JSON from endpoint, validates minimum shape (array or object with articles/results/items/data), returns DiscoveryFetchedPayload.
 */
import { createDiscoveryFetchedPayload } from "../entities/discovery-fetched-payload.entity.js";
import { createDiscoveryTransportMetadata } from "../entities/discovery-transport-metadata.entity.js";
import { createDiscoveryFetchFailure } from "../entities/discovery-fetch-failure.entity.js";
import { DiscoverySourceKind } from "../enums/discovery-source-kind.enum.js";
import { DiscoveryContentType } from "../enums/discovery-content-type.enum.js";
import { executeFetch } from "./fetch-helpers.js";
import { createTimestamp } from "../../value-objects/timestamp.vo.js";
const ITEM_KEYS = ["articles", "results", "items", "data"];
function hasItemsArray(raw) {
    if (Array.isArray(raw) && raw.length > 0)
        return true;
    for (const key of ITEM_KEYS) {
        const val = raw[key];
        if (Array.isArray(val))
            return true;
    }
    return false;
}
export const jsonApiConnector = {
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
                    message: "API connector expects JSON object body",
                    retryable: false,
                    detailsNullable: null,
                }),
            };
        }
        const raw = result.body;
        if (!hasItemsArray(raw)) {
            return {
                ok: false,
                failure: createDiscoveryFetchFailure({
                    code: "UNSUPPORTED_SHAPE",
                    message: "JSON payload has no supported items array (articles/results/items/data)",
                    retryable: false,
                    detailsNullable: { keys: Object.keys(raw) },
                }),
            };
        }
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
//# sourceMappingURL=json-api-connector.js.map