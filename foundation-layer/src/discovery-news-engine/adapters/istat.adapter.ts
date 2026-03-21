/**
 * ISTAT API / SDMX-compatible source adapter.
 * Uses apiPassthroughConnector; normalizer maps ISTAT/SDMX-like JSON to NormalizedDiscoveryPayload.
 * Does not invent fields unsupported by the source shape.
 */

import type { DiscoveryNormalizationAdapter, DiscoveryNormalizationContext } from "../interfaces/discovery-normalization-adapter.js";
import type { DiscoveryFetchedPayload } from "../entities/discovery-fetched-payload.entity.js";
import type { NormalizedDiscoveryPayload } from "../entities/normalized-discovery-payload.entity.js";
import type { NormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import { createNormalizedDiscoveryPayload } from "../entities/normalized-discovery-payload.entity.js";
import { createNormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import { createNormalizedSourceReference } from "../value-objects/normalized-source-reference.vo.js";
import { buildDiscoveryProvenanceMetadata } from "../entities/discovery-provenance-metadata.entity.js";
import { createDiscoveryRunId } from "../value-objects/discovery-run-id.vo.js";
import { createTimestamp } from "../../value-objects/timestamp.vo.js";
import type { DiscoverySourceAdapter } from "./source-adapter.types.js";
import { createDiscoverySourceKey } from "../value-objects/discovery-source-key.vo.js";
import { apiPassthroughConnector } from "../connectors/api-passthrough-connector.js";

const ISTAT_ITEM_KEYS = ["data", "dataset", "datasets", "series", "dataSets"] as const;

function getItemsArray(raw: Record<string, unknown>): readonly Record<string, unknown>[] | null {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  // SDMX-JSON 1.0: { "data": { "dataSets": [ ... ] } }
  const data = raw.data as Record<string, unknown> | undefined;
  if (data && typeof data === "object" && Array.isArray(data.dataSets)) {
    return data.dataSets as Record<string, unknown>[];
  }
  for (const key of ISTAT_ITEM_KEYS) {
    const val = (raw as Record<string, unknown>)[key];
    if (Array.isArray(val)) return val as Record<string, unknown>[];
  }
  return null;
}

function getString(obj: Record<string, unknown>, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function getDate(obj: Record<string, unknown>, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string") {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) return d.toISOString();
    }
    if (typeof v === "number" && Number.isFinite(v)) {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) return d.toISOString();
    }
  }
  return null;
}

export const istatNormalizationAdapter: DiscoveryNormalizationAdapter = {
  normalize(payload: DiscoveryFetchedPayload, context: DiscoveryNormalizationContext): NormalizedDiscoveryPayload {
    const raw = payload.raw;
    const itemsArray = getItemsArray(raw);
    if (!itemsArray || itemsArray.length === 0) {
      throw new Error("No items to normalize: ISTAT payload has no supported items array (data/dataset/datasets/series) or array is empty");
    }

    const definition = context.sourceDefinition;
    const fetchedAt = payload.transportMetadata.fetchedAt as string;
    const fetchedAtTimestamp = createTimestamp(fetchedAt);

    const normalizedItems: NormalizedDiscoveryItem[] = [];
    itemsArray.forEach((rec, index) => {
      const headline =
        getString(rec, "title", "label", "description", "name") ??
        getString(rec, "id") ??
        `Dataset ISTAT ${index + 1}`;
      const canonicalUrl = getString(rec, "link", "url", "uri", "permalink");
      const locator = canonicalUrl ?? `https://www.istat.it/dataset/${encodeURIComponent(String(getString(rec, "id") ?? ""))}`;
      const externalItemId = getString(rec, "id", "identifier") ?? locator;
      const publishedAtStr = getDate(rec, "lastUpdate", "date", "updated", "publishedAt", "created");
      const publishedAt = createTimestamp(publishedAtStr ?? fetchedAt);
      const publishedAtPresent = publishedAtStr != null;
      const bodySnippet = getString(rec, "description", "abstract", "summary") ?? null;

      normalizedItems.push(
        createNormalizedDiscoveryItem({
          headline,
          bodySnippetNullable: bodySnippet,
          canonicalUrl: locator,
          externalItemId,
          publishedAt,
          publishedAtPresent,
          sourceReference: createNormalizedSourceReference({
            sourceId: definition.id,
            locator,
            labelNullable: "ISTAT",
            sourceKeyNullable: definition.key,
          }),
          geoSignalNullable: definition.geoScope,
          geoPlaceTextNullable: null,
          topicSignalNullable: definition.topicScope,
          languageCode: "it",
          observedMetricsNullable: null,
        }),
      );
    });

    if (normalizedItems.length === 0) {
      throw new Error("No items to normalize: no ISTAT record had required headline");
    }

    const runIdNullable =
      context.runIdNullable != null && String(context.runIdNullable).startsWith("drun_")
        ? createDiscoveryRunId(context.runIdNullable as string)
        : null;

    const provenanceMetadata = buildDiscoveryProvenanceMetadata(
      definition,
      fetchedAtTimestamp,
      runIdNullable,
      {
        transportMetadata: payload.transportMetadata,
        adapterKey: String(definition.key),
      },
    );

    return createNormalizedDiscoveryPayload({
      items: normalizedItems,
      provenanceMetadata,
      sourceId: definition.id,
    });
  },
};

export const istatSourceAdapter: DiscoverySourceAdapter = {
  sourceKey: createDiscoverySourceKey("istat-sdmx"),
  connector: apiPassthroughConnector,
  normalizer: istatNormalizationAdapter,
};
