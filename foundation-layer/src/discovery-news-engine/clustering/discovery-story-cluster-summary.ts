/**
 * Build minimal cluster summary from a cluster and resolved items/signals.
 */

import type { Timestamp } from "../../value-objects/timestamp.vo.js";
import type { DiscoveryStoryCluster } from "../entities/discovery-story-cluster.entity.js";
import type {
  DiscoveryStoryClusterSummary,
  DiscoveryStoryClusterSummaryMemberIds,
  DiscoveryStoryClusterTimeSpan,
  DiscoveryStoryClusterTopicGeoSummary,
} from "../entities/discovery-story-cluster-summary.entity.js";
import type { DiscoverySignalId } from "../value-objects/discovery-signal-id.vo.js";
import { createDiscoveryStoryClusterSummary } from "../entities/discovery-story-cluster-summary.entity.js";
import type { NormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import type { DiscoverySignal } from "../entities/discovery-signal.entity.js";
import { DiscoveryGeoScope } from "../enums/discovery-geo-scope.enum.js";
import { DiscoveryTopicScope } from "../enums/discovery-topic-scope.enum.js";

function getSourceKeyFromItem(item: NormalizedDiscoveryItem): string {
  return item.sourceReference.sourceKeyNullable != null
    ? String(item.sourceReference.sourceKeyNullable).trim()
    : String(item.sourceReference.sourceId).trim();
}

/**
 * Build a minimal summary for a story cluster.
 * itemsById: map from normalized item id to item (for memberItemIds).
 * signalsById: optional map from signal id to signal (for memberSignalIds).
 */
export function buildDiscoveryStoryClusterSummary(
  cluster: DiscoveryStoryCluster,
  itemsById: Map<string, NormalizedDiscoveryItem>,
  signalsById?: Map<string, DiscoverySignal>,
): DiscoveryStoryClusterSummary {
  const itemIds = [...cluster.memberItemIds];
  const signalIds =
    cluster.memberSignalIds.length > 0 ? [...cluster.memberSignalIds] : undefined;

  const items = itemIds
    .map((id) => itemsById.get(id))
    .filter((x): x is NormalizedDiscoveryItem => x != null);

  let representativeHeadlineOrItemId = "";
  const sourceKeys = new Set<string>();
  const timestamps: string[] = [];
  const topics: DiscoveryTopicScope[] = [];
  const geos: DiscoveryGeoScope[] = [];

  for (const item of items) {
    if (!representativeHeadlineOrItemId && item.headline?.trim()) {
      representativeHeadlineOrItemId = item.headline.trim();
    }
    sourceKeys.add(getSourceKeyFromItem(item));
    if (item.publishedAt) timestamps.push(item.publishedAt);
    if (item.topicSignalNullable != null) topics.push(item.topicSignalNullable);
    if (item.geoSignalNullable != null) geos.push(item.geoSignalNullable);
  }
  if (!representativeHeadlineOrItemId && itemIds[0]) {
    representativeHeadlineOrItemId = itemIds[0];
  }

  let timeSpanNullable: DiscoveryStoryClusterTimeSpan | null = null;
  if (timestamps.length > 0) {
    const sorted = [...timestamps].sort();
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (first != null && last != null) {
      timeSpanNullable = {
        earliest: first as Timestamp,
        latest: last as Timestamp,
      };
    }
  }

  const uniqueTopics = new Set(topics);
  const uniqueGeos = new Set(geos);
  const topicGeoSummaryNullable: DiscoveryStoryClusterTopicGeoSummary | null =
    uniqueTopics.size === 1 || uniqueGeos.size === 1
      ? {
          ...(uniqueTopics.size === 1 && topics[0] != null ? { topic: topics[0] } : {}),
          ...(uniqueGeos.size === 1 && geos[0] != null ? { geo: geos[0] } : {}),
        }
      : null;

  const memberIds: DiscoveryStoryClusterSummaryMemberIds =
    signalIds != null && signalIds.length > 0
      ? { itemIds, signalIds }
      : { itemIds };

  return createDiscoveryStoryClusterSummary({
    clusterId: cluster.clusterId,
    memberIds,
    representativeHeadlineOrItemId,
    sourceDiversityCount: sourceKeys.size,
    timeSpanNullable,
    topicGeoSummaryNullable,
  });
}
