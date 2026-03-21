/**
 * JSON/API normalization: DiscoveryFetchedPayload (generic JSON with items array) → NormalizedDiscoveryPayload.
 * Supports top-level array or object with articles/results/items/data as array.
 * Generic field mapping: title, headline, url, link, publishedAt, pubDate, published_at, etc.
 */
import { createNormalizedDiscoveryPayload } from "../entities/normalized-discovery-payload.entity.js";
import { createNormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import { createNormalizedSourceReference } from "../value-objects/normalized-source-reference.vo.js";
import { buildDiscoveryProvenanceMetadata } from "../entities/discovery-provenance-metadata.entity.js";
import { createDiscoveryRunId } from "../value-objects/discovery-run-id.vo.js";
import { createTimestamp } from "../../value-objects/timestamp.vo.js";
const ITEM_KEYS = ["articles", "results", "items", "data"];
function getItemsArray(raw) {
    if (Array.isArray(raw)) {
        return raw;
    }
    if (raw && typeof raw === "object") {
        for (const key of ITEM_KEYS) {
            const val = raw[key];
            if (Array.isArray(val))
                return val;
        }
    }
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
function getDate(obj, ...keys) {
    for (const k of keys) {
        const v = obj[k];
        if (typeof v === "string") {
            const d = new Date(v);
            if (!Number.isNaN(d.getTime()))
                return d.toISOString();
        }
        if (typeof v === "number" && Number.isFinite(v)) {
            const d = new Date(v);
            if (!Number.isNaN(d.getTime()))
                return d.toISOString();
        }
    }
    return null;
}
export function normalizeJsonApiPayload(payload, context) {
    const raw = payload.raw;
    const itemsArray = getItemsArray(raw);
    if (!itemsArray || itemsArray.length === 0) {
        throw new Error("JSON payload has no supported items array (articles/results/items/data) or array is empty");
    }
    const definition = context.sourceDefinition;
    const fetchedAt = payload.transportMetadata.fetchedAt;
    const fetchedAtTimestamp = createTimestamp(fetchedAt);
    const normalizedItems = [];
    for (let i = 0; i < itemsArray.length; i++) {
        const rec = itemsArray[i];
        const headline = getString(rec, "title", "headline", "name") ?? getString(rec, "headline", "title");
        const canonicalUrl = getString(rec, "url", "link", "canonicalUrl", "webUrl") ?? getString(rec, "link", "url");
        if (!headline || !canonicalUrl)
            continue;
        const externalItemId = getString(rec, "id", "guid", "url", "link") ?? canonicalUrl;
        const publishedAtStr = getDate(rec, "publishedAt", "pubDate", "published_at", "date", "createdAt");
        const publishedAt = createTimestamp(publishedAtStr ?? fetchedAt);
        const publishedAtPresent = publishedAtStr != null;
        const bodySnippet = getString(rec, "description", "content", "body", "snippet", "summary") ?? null;
        normalizedItems.push(createNormalizedDiscoveryItem({
            headline,
            bodySnippetNullable: bodySnippet,
            canonicalUrl,
            externalItemId,
            publishedAt,
            publishedAtPresent,
            sourceReference: createNormalizedSourceReference({
                sourceId: definition.id,
                locator: canonicalUrl,
                labelNullable: null,
                sourceKeyNullable: definition.key,
            }),
            geoSignalNullable: definition.geoScope,
            geoPlaceTextNullable: null,
            topicSignalNullable: definition.topicScope,
            languageCode: "it",
            observedMetricsNullable: null,
        }));
    }
    if (normalizedItems.length === 0) {
        throw new Error("No items to normalize: no record had required headline and url");
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
}
export const jsonApiNormalizationAdapter = {
    normalize(payload, context) {
        return normalizeJsonApiPayload(payload, context);
    },
};
//# sourceMappingURL=json-api-normalizer.js.map