/**
 * INGV earthquake/open data source adapter.
 * Uses apiPassthroughConnector; normalizer maps INGV event JSON to NormalizedDiscoveryPayload.
 * Does not invent fields unsupported by the source shape.
 */
import { createNormalizedDiscoveryPayload } from "../entities/normalized-discovery-payload.entity.js";
import { createNormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import { createNormalizedSourceReference } from "../value-objects/normalized-source-reference.vo.js";
import { buildDiscoveryProvenanceMetadata } from "../entities/discovery-provenance-metadata.entity.js";
import { createDiscoveryRunId } from "../value-objects/discovery-run-id.vo.js";
import { createTimestamp } from "../../value-objects/timestamp.vo.js";
import { createDiscoverySourceKey } from "../value-objects/discovery-source-key.vo.js";
import { apiPassthroughConnector } from "../connectors/api-passthrough-connector.js";
const INGV_ITEM_KEYS = ["features", "events", "data", "earthquakes"];
function getItemsArray(raw) {
    if (Array.isArray(raw))
        return raw;
    for (const key of INGV_ITEM_KEYS) {
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
function getRecord(obj, key) {
    const v = obj[key];
    if (v && typeof v === "object" && !Array.isArray(v))
        return v;
    return null;
}
export const ingvNormalizationAdapter = {
    normalize(payload, context) {
        const raw = payload.raw;
        const itemsArray = getItemsArray(raw);
        if (!itemsArray || itemsArray.length === 0) {
            throw new Error("No items to normalize: INGV payload has no supported items array (features/events/data/earthquakes) or array is empty");
        }
        const definition = context.sourceDefinition;
        const fetchedAt = payload.transportMetadata.fetchedAt;
        const fetchedAtTimestamp = createTimestamp(fetchedAt);
        const normalizedItems = [];
        for (let i = 0; i < itemsArray.length; i++) {
            const rec = itemsArray[i];
            const props = getRecord(rec, "properties") ?? rec;
            const time = getDate(rec, "time") ?? getDate(props, "time", "date");
            const mag = getNumber(rec, "mag", "magnitude") ?? getNumber(props, "mag", "magnitude");
            const place = getString(rec, "place", "location") ?? getString(props, "place", "title", "location");
            const id = getString(rec, "id") ?? getString(props, "id") ?? `ingv-${i}`;
            const headline = place
                ? (mag != null ? `M${mag} - ${place}` : place)
                : (mag != null ? `Magnitude ${mag}` : `Event ${id}`);
            const publishedAt = createTimestamp(time ?? fetchedAt);
            const publishedAtPresent = time != null;
            const locator = getString(rec, "url", "link") ?? getString(props, "url", "link") ?? `https://terremoti.ingv.it/event/${encodeURIComponent(id)}`;
            normalizedItems.push(createNormalizedDiscoveryItem({
                headline,
                bodySnippetNullable: null,
                canonicalUrl: locator,
                externalItemId: id,
                publishedAt,
                publishedAtPresent,
                sourceReference: createNormalizedSourceReference({
                    sourceId: definition.id,
                    locator,
                    labelNullable: "INGV",
                    sourceKeyNullable: definition.key,
                }),
                geoSignalNullable: definition.geoScope,
                geoPlaceTextNullable: place,
                topicSignalNullable: definition.topicScope,
                languageCode: "it",
                observedMetricsNullable: null,
            }));
        }
        if (normalizedItems.length === 0) {
            throw new Error("No items to normalize: no INGV record could be mapped");
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
export const ingvSourceAdapter = {
    sourceKey: createDiscoverySourceKey("ingv-terremoti"),
    connector: apiPassthroughConnector,
    normalizer: ingvNormalizationAdapter,
};
//# sourceMappingURL=ingv.adapter.js.map