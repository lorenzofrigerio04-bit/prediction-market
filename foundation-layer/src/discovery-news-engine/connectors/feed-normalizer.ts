/**
 * Feed normalization: DiscoveryFetchedPayload (raw RSS/Atom-like shape) → NormalizedDiscoveryPayload.
 * Parsed feed raw shape: { items: Array<{ link, title, pubDate?, description?, content?, guid? }>, feedTitle? }.
 * Adapted from lib/ingestion/fetchers/rss.ts item shape; output is engine NormalizedDiscoveryPayload.
 */

import type { DiscoveryNormalizationAdapter } from "../interfaces/discovery-normalization-adapter.js";
import type { DiscoveryFetchedPayload } from "../entities/discovery-fetched-payload.entity.js";
import type { DiscoveryNormalizationContext } from "../interfaces/discovery-normalization-adapter.js";
import type { NormalizedDiscoveryPayload } from "../entities/normalized-discovery-payload.entity.js";
import type { NormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import type { DiscoverySourceDefinition } from "../entities/discovery-source-definition.entity.js";
import type { DiscoveryGeoScope } from "../enums/discovery-geo-scope.enum.js";
import type { DiscoveryTopicScope } from "../enums/discovery-topic-scope.enum.js";
import { createNormalizedDiscoveryPayload } from "../entities/normalized-discovery-payload.entity.js";
import { createNormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import { createNormalizedSourceReference } from "../value-objects/normalized-source-reference.vo.js";
import { buildDiscoveryProvenanceMetadata } from "../entities/discovery-provenance-metadata.entity.js";
import { createDiscoveryRunId } from "../value-objects/discovery-run-id.vo.js";
import { createTimestamp } from "../../value-objects/timestamp.vo.js";

type FeedRawItem = Readonly<{
  link?: string;
  title?: string;
  pubDate?: string;
  description?: string;
  content?: string;
  contentSnippet?: string;
  guid?: string;
}>;

type FeedRawShape = Readonly<{
  items?: readonly FeedRawItem[];
  feedTitle?: string;
}>;

function isFeedRawShape(raw: Record<string, unknown>): raw is FeedRawShape {
  if (!raw || typeof raw !== "object") return false;
  const items = (raw as FeedRawShape).items;
  return Array.isArray(items);
}

function toNormalizedItem(
  item: FeedRawItem,
  definition: DiscoverySourceDefinition,
  locator: string,
  labelNullable: string | null,
  fetchedAt: string,
): NormalizedDiscoveryItem {
  const headline = (item.title ?? "").trim() || "Untitled";
  const canonicalUrl = (item.link ?? "").trim() || locator;
  const externalItemId = (item.guid ?? item.link ?? "").trim() || canonicalUrl;
  const bodySnippet =
    (item.contentSnippet ?? item.content ?? item.description ?? "").trim() || null;
  const hasPubDate = Boolean(item.pubDate?.trim());
  const pubDate = item.pubDate ? new Date(item.pubDate) : new Date(fetchedAt);
  const publishedAt = createTimestamp(
    Number.isNaN(pubDate.getTime()) ? fetchedAt : pubDate.toISOString(),
  );
  return createNormalizedDiscoveryItem({
    headline,
    bodySnippetNullable: bodySnippet,
    canonicalUrl,
    externalItemId,
    publishedAt,
    publishedAtPresent: hasPubDate,
    sourceReference: createNormalizedSourceReference({
      sourceId: definition.id,
      locator: canonicalUrl,
      labelNullable,
      sourceKeyNullable: definition.key,
    }),
    geoSignalNullable: definition.geoScope,
    geoPlaceTextNullable: null,
    topicSignalNullable: definition.topicScope,
    languageCode: "it",
    observedMetricsNullable: null,
  });
}

export function normalizeFeedPayload(
  payload: DiscoveryFetchedPayload,
  context: DiscoveryNormalizationContext,
): NormalizedDiscoveryPayload {
  const raw = payload.raw;
  if (!isFeedRawShape(raw)) {
    throw new Error("Feed payload raw shape must have items array");
  }
  const items = raw.items ?? [];
  const definition = context.sourceDefinition;
  const fetchedAt = payload.transportMetadata.fetchedAt as string;
  const fetchedAtTimestamp = createTimestamp(fetchedAt);
  const labelNullable = (raw as { feedTitle?: string }).feedTitle ?? null;

  const normalizedItems: NormalizedDiscoveryItem[] = [];
  for (const item of items) {
    const link = (item.link ?? "").trim();
    const title = (item.title ?? "").trim();
    if (!link || !title) continue;
    normalizedItems.push(
      toNormalizedItem(item, definition, link, labelNullable, fetchedAt),
    );
  }

  if (normalizedItems.length === 0) {
    throw new Error("No items to normalize: feed had no valid items (link+title required)");
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
}

export const feedNormalizationAdapter: DiscoveryNormalizationAdapter = {
  normalize(payload: DiscoveryFetchedPayload, context: DiscoveryNormalizationContext): NormalizedDiscoveryPayload {
    return normalizeFeedPayload(payload, context);
  },
};
