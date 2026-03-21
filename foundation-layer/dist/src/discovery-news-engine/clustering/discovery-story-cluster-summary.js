/**
 * Build minimal cluster summary from a cluster and resolved items/signals.
 */
import { createDiscoveryStoryClusterSummary } from "../entities/discovery-story-cluster-summary.entity.js";
function getSourceKeyFromItem(item) {
    return item.sourceReference.sourceKeyNullable != null
        ? String(item.sourceReference.sourceKeyNullable).trim()
        : String(item.sourceReference.sourceId).trim();
}
/**
 * Build a minimal summary for a story cluster.
 * itemsById: map from normalized item id to item (for memberItemIds).
 * signalsById: optional map from signal id to signal (for memberSignalIds).
 */
export function buildDiscoveryStoryClusterSummary(cluster, itemsById, signalsById) {
    const itemIds = [...cluster.memberItemIds];
    const signalIds = cluster.memberSignalIds.length > 0 ? [...cluster.memberSignalIds] : undefined;
    const items = itemIds
        .map((id) => itemsById.get(id))
        .filter((x) => x != null);
    let representativeHeadlineOrItemId = "";
    const sourceKeys = new Set();
    const timestamps = [];
    const topics = [];
    const geos = [];
    for (const item of items) {
        if (!representativeHeadlineOrItemId && item.headline?.trim()) {
            representativeHeadlineOrItemId = item.headline.trim();
        }
        sourceKeys.add(getSourceKeyFromItem(item));
        if (item.publishedAt)
            timestamps.push(item.publishedAt);
        if (item.topicSignalNullable != null)
            topics.push(item.topicSignalNullable);
        if (item.geoSignalNullable != null)
            geos.push(item.geoSignalNullable);
    }
    if (!representativeHeadlineOrItemId && itemIds[0]) {
        representativeHeadlineOrItemId = itemIds[0];
    }
    let timeSpanNullable = null;
    if (timestamps.length > 0) {
        const sorted = [...timestamps].sort();
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        if (first != null && last != null) {
            timeSpanNullable = {
                earliest: first,
                latest: last,
            };
        }
    }
    const uniqueTopics = new Set(topics);
    const uniqueGeos = new Set(geos);
    const topicGeoSummaryNullable = uniqueTopics.size === 1 || uniqueGeos.size === 1
        ? {
            ...(uniqueTopics.size === 1 && topics[0] != null ? { topic: topics[0] } : {}),
            ...(uniqueGeos.size === 1 && geos[0] != null ? { geo: geos[0] } : {}),
        }
        : null;
    const memberIds = signalIds != null && signalIds.length > 0
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
//# sourceMappingURL=discovery-story-cluster-summary.js.map