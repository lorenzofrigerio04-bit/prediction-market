/**
 * Wikimedia Pageviews API adapter.
 * Uses apiPassthroughConnector; normalizer maps pageview JSON to NormalizedDiscoveryPayload.
 * Attention signal only; no ranking or scoring.
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
const WIKIMEDIA_ITEM_KEYS = ["items"];
function getItemsArray(raw) {
    if (Array.isArray(raw))
        return raw;
    for (const key of WIKIMEDIA_ITEM_KEYS) {
        const val = raw[key];
        if (Array.isArray(val))
            return val;
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
function getNumber(obj, ...keys) {
    for (const k of keys) {
        const v = obj[k];
        if (typeof v === "number" && Number.isFinite(v))
            return v;
    }
    return null;
}
/** Convert Wikimedia timestamp (YYYYMMDD00 or YYYYMMDD) to ISO date string. */
function timestampToIso(ts) {
    if (!ts || typeof ts !== "string")
        return null;
    const cleaned = ts.slice(0, 8);
    if (cleaned.length !== 8)
        return null;
    const y = cleaned.slice(0, 4);
    const m = cleaned.slice(4, 6);
    const d = cleaned.slice(6, 8);
    const iso = `${y}-${m}-${d}T00:00:00.000Z`;
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
/** Build canonical wiki URL from project (e.g. en.wikipedia) and article title. */
function buildWikiUrl(project, article) {
    const base = project.includes(".") ? project : `${project}.wikipedia`;
    const domain = base.endsWith(".org") ? base : `${base}.org`;
    return `https://${domain}/wiki/${encodeURIComponent(article.replace(/ /g, "_"))}`;
}
/** Infer language code from project (e.g. en.wikipedia -> en). */
function projectToLanguage(project) {
    const match = project.match(/^([a-z]{2,3})\./);
    return match ? match[1] : "en";
}
export const wikimediaPageviewsNormalizationAdapter = {
    normalize(payload, context) {
        const raw = payload.raw;
        const itemsArray = getItemsArray(raw);
        if (!itemsArray || itemsArray.length === 0) {
            throw new Error("No items to normalize: Wikimedia Pageviews payload has no items array or array is empty");
        }
        const definition = context.sourceDefinition;
        const fetchedAt = typeof payload.transportMetadata.fetchedAt === "string"
            ? payload.transportMetadata.fetchedAt
            : payload.transportMetadata.fetchedAt?.iso ?? new Date().toISOString();
        const fetchedAtTimestamp = createTimestamp(fetchedAt);
        const normalizedItems = [];
        for (const rec of itemsArray) {
            const project = getString(rec, "project") ?? "en.wikipedia";
            const article = getString(rec, "article", "title");
            if (!article)
                continue;
            const headline = article.replace(/_/g, " ");
            const canonicalUrl = buildWikiUrl(project, article);
            const ts = getString(rec, "timestamp");
            const publishedAtIso = timestampToIso(ts);
            const publishedAt = createTimestamp(publishedAtIso ?? fetchedAt);
            const publishedAtPresent = publishedAtIso != null;
            const views = getNumber(rec, "views");
            const observedMetricsNullable = views != null ? createDiscoveryObservedMetrics({ pageviewsNullable: views }) : null;
            const externalItemId = `${project}:${article}:${ts ?? "unknown"}`;
            normalizedItems.push(createNormalizedDiscoveryItem({
                headline,
                bodySnippetNullable: null,
                canonicalUrl,
                externalItemId,
                publishedAt,
                publishedAtPresent,
                sourceReference: createNormalizedSourceReference({
                    sourceId: definition.id,
                    locator: canonicalUrl,
                    labelNullable: "Wikimedia Pageviews",
                    sourceKeyNullable: definition.key,
                }),
                geoSignalNullable: definition.geoScope,
                geoPlaceTextNullable: null,
                topicSignalNullable: definition.topicScope,
                languageCode: projectToLanguage(project),
                observedMetricsNullable,
            }));
        }
        if (normalizedItems.length === 0) {
            throw new Error("No items to normalize: no Wikimedia Pageviews record had required article");
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
export const wikimediaPageviewsSourceAdapter = {
    sourceKey: createDiscoverySourceKey("wikimedia-pageviews"),
    connector: apiPassthroughConnector,
    normalizer: wikimediaPageviewsNormalizationAdapter,
};
//# sourceMappingURL=wikimedia-pageviews.adapter.js.map