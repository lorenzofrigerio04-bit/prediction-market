/**
 * Manual raw input bridge: accepts controlled manual/raw input, validates, returns DiscoveryFetchedPayload.
 * Use request.manualPayloadNullable with shape { items: Array<{ title/headline, url/link, ... }> } or single item.
 */

import type { DiscoverySourceConnector } from "../interfaces/discovery-source-connector.js";
import type { DiscoveryFetchRequest } from "../entities/discovery-fetch-request.entity.js";
import type { DiscoveryFetchResponse } from "../entities/discovery-fetch-response.entity.js";
import type { DiscoverySourceDefinition } from "../entities/discovery-source-definition.entity.js";
import { createDiscoveryFetchedPayload } from "../entities/discovery-fetched-payload.entity.js";
import { createDiscoveryTransportMetadata } from "../entities/discovery-transport-metadata.entity.js";
import { createDiscoveryFetchFailure } from "../entities/discovery-fetch-failure.entity.js";
import { createDiscoveryValidationFailure } from "../entities/discovery-validation-failure.entity.js";
import { DiscoverySourceKind } from "../enums/discovery-source-kind.enum.js";
import { DiscoveryContentType } from "../enums/discovery-content-type.enum.js";
import { createTimestamp } from "../../value-objects/timestamp.vo.js";

function getString(obj: Record<string, unknown>, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function validateManualPayload(
  raw: Record<string, unknown>,
): { ok: true; items: readonly Record<string, unknown>[] } | { ok: false; validationFailures: ReturnType<typeof createDiscoveryValidationFailure>[] } {
  const failures: ReturnType<typeof createDiscoveryValidationFailure>[] = [];
  let items: Record<string, unknown>[] = [];

  if (Array.isArray(raw.items) && raw.items.length > 0) {
    items = raw.items as Record<string, unknown>[];
  } else if (raw.title !== undefined || raw.headline !== undefined || raw.url !== undefined || raw.link !== undefined) {
    items = [raw];
  } else {
    failures.push(
      createDiscoveryValidationFailure({
        code: "INVALID_SHAPE",
        path: "",
        message: "Manual payload must have 'items' array or single item with title/headline and url/link",
        contextNullable: { keys: Object.keys(raw) },
      }),
    );
    return { ok: false, validationFailures: failures };
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    const title = getString(item, "title", "headline");
    const url = getString(item, "url", "link", "canonicalUrl");
    if (!title) {
      failures.push(
        createDiscoveryValidationFailure({
          code: "MISSING_FIELD",
          path: `items/${i}/title`,
          message: "Item must have title or headline",
          contextNullable: null,
        }),
      );
    }
    if (!url) {
      failures.push(
        createDiscoveryValidationFailure({
          code: "MISSING_FIELD",
          path: `items/${i}/url`,
          message: "Item must have url or link",
          contextNullable: null,
        }),
      );
    }
  }

  if (failures.length > 0) {
    return { ok: false, validationFailures: failures };
  }
  return { ok: true, items };
}

export const manualInputBridgeConnector: DiscoverySourceConnector = {
  canHandle(definition: DiscoverySourceDefinition): boolean {
    return definition.kind === DiscoverySourceKind.MANUAL;
  },

  async fetch(request: DiscoveryFetchRequest): Promise<DiscoveryFetchResponse> {
    const manualPayload = request.manualPayloadNullable ?? null;
    if (manualPayload === null || typeof manualPayload !== "object") {
      return {
        ok: false,
        failure: createDiscoveryFetchFailure({
          code: "INVALID_INPUT",
          message: "Manual source requires manualPayloadNullable with items or single item",
          retryable: false,
          detailsNullable: { validationFailures: [] },
        }),
      };
    }

    const validated = validateManualPayload(manualPayload);
    if (!validated.ok) {
      return {
        ok: false,
        failure: createDiscoveryFetchFailure({
          code: "INVALID_INPUT",
          message: "Manual payload validation failed",
          retryable: false,
          detailsNullable: { validationFailures: validated.validationFailures },
        }),
      };
    }

    const payload = createDiscoveryFetchedPayload({
      raw: { items: validated.items },
      transportMetadata: createDiscoveryTransportMetadata({
        contentType: DiscoveryContentType.APPLICATION_JSON,
        fetchedAt: createTimestamp(new Date().toISOString()),
        statusCodeNullable: null,
        etagNullable: null,
      }),
    });
    return { ok: true, payload };
  },
};
