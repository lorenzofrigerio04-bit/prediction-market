/**
 * Structured HTTP JSON/API connector.
 * Fetches JSON from endpoint, validates minimum shape (array or object with articles/results/items/data), returns DiscoveryFetchedPayload.
 */

import type { DiscoverySourceConnector } from "../interfaces/discovery-source-connector.js";
import type { DiscoveryFetchRequest } from "../entities/discovery-fetch-request.entity.js";
import type { DiscoveryFetchResponse } from "../entities/discovery-fetch-response.entity.js";
import type { DiscoverySourceDefinition } from "../entities/discovery-source-definition.entity.js";
import { createDiscoveryFetchedPayload } from "../entities/discovery-fetched-payload.entity.js";
import { createDiscoveryTransportMetadata } from "../entities/discovery-transport-metadata.entity.js";
import { createDiscoveryFetchFailure } from "../entities/discovery-fetch-failure.entity.js";
import { DiscoverySourceKind } from "../enums/discovery-source-kind.enum.js";
import { DiscoveryContentType } from "../enums/discovery-content-type.enum.js";
import { executeFetch } from "./fetch-helpers.js";
import { createTimestamp } from "../../value-objects/timestamp.vo.js";

const ITEM_KEYS = ["articles", "results", "items", "data"];

function hasItemsArray(raw: Record<string, unknown>): boolean {
  if (Array.isArray(raw) && raw.length > 0) return true;
  for (const key of ITEM_KEYS) {
    const val = (raw as Record<string, unknown>)[key];
    if (Array.isArray(val)) return true;
  }
  return false;
}

export const jsonApiConnector: DiscoverySourceConnector = {
  canHandle(definition: DiscoverySourceDefinition): boolean {
    return definition.kind === DiscoverySourceKind.API;
  },

  async fetch(request: DiscoveryFetchRequest): Promise<DiscoveryFetchResponse> {
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

    const raw = result.body as Record<string, unknown>;
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
