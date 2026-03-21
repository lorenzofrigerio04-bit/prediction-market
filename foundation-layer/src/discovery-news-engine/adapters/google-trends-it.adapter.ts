/**
 * Google Trends Italy adapter (experimental / optional).
 * Uses apiPassthroughConnector; normalizer maps trend/query JSON to NormalizedDiscoveryPayload.
 * Supports degraded behavior when payload is empty or missing required keys; no live dependency in tests.
 */

import type { DiscoveryNormalizationAdapter, DiscoveryNormalizationContext } from "../interfaces/discovery-normalization-adapter.js";
import type { DiscoveryFetchedPayload } from "../entities/discovery-fetched-payload.entity.js";
import type { NormalizedDiscoveryPayload } from "../entities/normalized-discovery-payload.entity.js";
import type { NormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import { createNormalizedDiscoveryPayload } from "../entities/normalized-discovery-payload.entity.js";
import { createNormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import { createNormalizedSourceReference } from "../value-objects/normalized-source-reference.vo.js";
import { createDiscoveryObservedMetrics } from "../value-objects/discovery-observed-metrics.vo.js";
import { buildDiscoveryProvenanceMetadata } from "../entities/discovery-provenance-metadata.entity.js";
import { createDiscoveryRunId } from "../value-objects/discovery-run-id.vo.js";
import { createTimestamp } from "../../value-objects/timestamp.vo.js";
import type { DiscoverySourceAdapter } from "./source-adapter.types.js";
import { createDiscoverySourceKey } from "../value-objects/discovery-source-key.vo.js";
import { apiPassthroughConnector } from "../connectors/api-passthrough-connector.js";

const TRENDS_ITEM_KEYS = ["items", "trendingQueries", "queries"] as const;

function getItemsArray(raw: Record<string, unknown>): readonly Record<string, unknown>[] | null {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  for (const key of TRENDS_ITEM_KEYS) {
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

function slugify(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "");
}

export const googleTrendsItNormalizationAdapter: DiscoveryNormalizationAdapter = {
  normalize(payload: DiscoveryFetchedPayload, context: DiscoveryNormalizationContext): NormalizedDiscoveryPayload {
    const raw = payload.raw;
    const itemsArray = getItemsArray(raw);
    if (!itemsArray || itemsArray.length === 0) {
      throw new Error("No items to normalize: Google Trends payload has no items/trendingQueries/queries array or array is empty");
    }

    const definition = context.sourceDefinition;
    const fetchedAt =
      typeof payload.transportMetadata.fetchedAt === "string"
        ? payload.transportMetadata.fetchedAt
        : (payload.transportMetadata.fetchedAt as { iso: string })?.iso ?? new Date().toISOString();
    const fetchedAtTimestamp = createTimestamp(fetchedAt);

    const normalizedItems: NormalizedDiscoveryItem[] = [];
    for (const rec of itemsArray) {
      const query = getString(rec, "query", "title", "topic", "term");
      if (!query) continue;
      const headline = query;
      const externalId = slugify(query) || encodeURIComponent(query);
      const canonicalUrl = `https://trends.google.com/trends/explore?q=${encodeURIComponent(query)}&geo=IT`;
      const timeframe = getString(rec, "timeframe", "time_window", "date");
      const region = getString(rec, "region", "geo");
      const observedMetricsNullable =
        timeframe != null || region != null
          ? createDiscoveryObservedMetrics({
              ...(timeframe != null && { timeframeNullable: timeframe }),
              ...(region != null && { regionNullable: region }),
            })
          : null;
      const publishedAt = createTimestamp(fetchedAt);

      normalizedItems.push(
        createNormalizedDiscoveryItem({
          headline,
          bodySnippetNullable: null,
          canonicalUrl,
          externalItemId: externalId,
          publishedAt,
          publishedAtPresent: false,
          sourceReference: createNormalizedSourceReference({
            sourceId: definition.id,
            locator: canonicalUrl,
            labelNullable: "Google Trends",
            sourceKeyNullable: definition.key,
          }),
          geoSignalNullable: definition.geoScope,
          geoPlaceTextNullable: null,
          topicSignalNullable: definition.topicScope,
          languageCode: "it",
          observedMetricsNullable,
        }),
      );
    }

    if (normalizedItems.length === 0) {
      throw new Error("No items to normalize: no Google Trends record had required query/title/topic");
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

export const googleTrendsItSourceAdapter: DiscoverySourceAdapter = {
  sourceKey: createDiscoverySourceKey("google-trends-it"),
  connector: apiPassthroughConnector,
  normalizer: googleTrendsItNormalizationAdapter,
};
