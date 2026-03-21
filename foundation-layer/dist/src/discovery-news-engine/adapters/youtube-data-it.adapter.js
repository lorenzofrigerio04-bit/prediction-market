/**
 * YouTube Data API (Italy) adapter.
 * Uses apiPassthroughConnector; normalizer maps search/list or videos/list JSON to NormalizedDiscoveryPayload.
 * Region-awareness from catalog (geoScope IT); no inference of unsupported fields.
 */
import { createNormalizedDiscoveryPayload } from "../entities/normalized-discovery-payload.entity.js";
import { createNormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import { createNormalizedSourceReference } from "../value-objects/normalized-source-reference.vo.js";
import { createDiscoveryObservedMetrics } from "../value-objects/discovery-observed-metrics.vo.js";
import { buildDiscoveryProvenanceMetadata } from "../entities/discovery-provenance-metadata.entity.js";
import { createDiscoveryRunId } from "../value-objects/discovery-run-id.vo.js";
import { createTimestamp } from "../../value-objects/timestamp.vo.js";
import { createDiscoverySourceKey } from "../value-objects/discovery-source-key.vo.js";
import { apiPassthroughConnector } from "../connectors/api-passthrough-connector.js";
const YOUTUBE_ITEM_KEYS = ["items"];
const MAX_BODY_SNIPPET_LEN = 300;
function getItemsArray(raw) {
    const val = raw.items;
    if (Array.isArray(val))
        return val;
    return null;
}
function getString(obj, ...keys) {
    for (const k of keys) {
        const v = obj[k];
        if (typeof v === "string" && v.trim())
            return v.trim();
    }
    return null;
}
function getRecord(obj, key) {
    const v = obj[key];
    if (v && typeof v === "object" && !Array.isArray(v))
        return v;
    return null;
}
function getVideoId(item) {
    const idBlock = getRecord(item, "id");
    if (idBlock) {
        const videoId = getString(idBlock, "videoId");
        if (videoId)
            return videoId;
    }
    return getString(item, "id");
}
function truncate(s, max) {
    if (s.length <= max)
        return s;
    return s.slice(0, max - 3) + "...";
}
export const youtubeDataItNormalizationAdapter = {
    normalize(payload, context) {
        const raw = payload.raw;
        const itemsArray = getItemsArray(raw);
        if (!itemsArray || itemsArray.length === 0) {
            throw new Error("No items to normalize: YouTube payload has no items array or array is empty");
        }
        const definition = context.sourceDefinition;
        const fetchedAt = typeof payload.transportMetadata.fetchedAt === "string"
            ? payload.transportMetadata.fetchedAt
            : payload.transportMetadata.fetchedAt?.iso ?? new Date().toISOString();
        const fetchedAtTimestamp = createTimestamp(fetchedAt);
        const normalizedItems = [];
        for (const item of itemsArray) {
            const videoId = getVideoId(item);
            if (!videoId)
                continue;
            const snippet = getRecord(item, "snippet") ?? item;
            const title = getString(snippet, "title");
            if (!title)
                continue;
            const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
            const publishedAtStr = getString(snippet, "publishedAt");
            const publishedAt = createTimestamp(publishedAtStr ?? fetchedAt);
            const publishedAtPresent = publishedAtStr != null;
            const description = getString(snippet, "description");
            const bodySnippet = description ? truncate(description, MAX_BODY_SNIPPET_LEN) : null;
            const channelId = getString(snippet, "channelId");
            const observedMetricsNullable = channelId != null ? createDiscoveryObservedMetrics({ channelIdNullable: channelId }) : null;
            normalizedItems.push(createNormalizedDiscoveryItem({
                headline: title,
                bodySnippetNullable: bodySnippet,
                canonicalUrl,
                externalItemId: videoId,
                publishedAt,
                publishedAtPresent,
                sourceReference: createNormalizedSourceReference({
                    sourceId: definition.id,
                    locator: canonicalUrl,
                    labelNullable: "YouTube",
                    sourceKeyNullable: definition.key,
                }),
                geoSignalNullable: definition.geoScope,
                geoPlaceTextNullable: null,
                topicSignalNullable: definition.topicScope,
                languageCode: "it",
                observedMetricsNullable,
            }));
        }
        if (normalizedItems.length === 0) {
            throw new Error("No items to normalize: no YouTube item had required videoId and title");
        }
        const runIdNullable = context.runIdNullable != null && String(context.runIdNullable).startsWith("drun_")
            ? createDiscoveryRunId(context.runIdNullable)
            : null;
        const provenanceMetadata = buildDiscoveryProvenanceMetadata(definition, fetchedAtTimestamp, runIdNullable, {
            transportMetadata: payload.transportMetadata,
            adapterKey: String(definition.key),
        });
        return createNormalizedDiscoveryPayload({
            items: normalizedItems,
            provenanceMetadata,
            sourceId: definition.id,
        });
    },
};
export const youtubeDataItSourceAdapter = {
    sourceKey: createDiscoverySourceKey("youtube-data-it"),
    connector: apiPassthroughConnector,
    normalizer: youtubeDataItNormalizationAdapter,
};
//# sourceMappingURL=youtube-data-it.adapter.js.map