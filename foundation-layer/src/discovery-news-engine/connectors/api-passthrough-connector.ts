/**
 * API passthrough connector: fetches JSON and returns raw response without shape validation.
 * Used by source adapters (e.g. ISTAT, INGV) whose API response shape is not articles/results/items/data.
 * Source-specific normalizers map the raw JSON to NormalizedDiscoveryPayload.
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

export const apiPassthroughConnector: DiscoverySourceConnector = {
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
          message: "API passthrough connector expects JSON object body",
          retryable: false,
          detailsNullable: null,
        }),
      };
    }

    const raw = result.body as Record<string, unknown>;
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
