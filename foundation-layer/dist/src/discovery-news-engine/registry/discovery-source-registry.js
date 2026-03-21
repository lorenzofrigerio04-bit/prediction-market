/**
 * Discovery Source Registry – immutable in-memory registry.
 * Single canonical list of discovery sources; access by key, role, tier, geo, status.
 */
import { deepFreeze } from "../../common/utils/deep-freeze.js";
import { INITIAL_DISCOVERY_SOURCE_CATALOG } from "./discovery-source-catalog.js";
function byKey(entries, key) {
    const k = typeof key === "string" ? key : key;
    return entries.find((e) => e.key === k);
}
function byRole(entries, role) {
    return entries.filter((e) => e.role === role);
}
function byTier(entries, tier) {
    return entries.filter((e) => e.tier === tier);
}
function byGeoScope(entries, geoScope) {
    return entries.filter((e) => e.geoScope === geoScope);
}
function byStatus(entries, status) {
    return entries.filter((e) => e.status === status);
}
/**
 * Builds an immutable registry from a catalog array.
 * Keys must be unique; duplicate keys are not checked here (validate at catalog build time).
 */
export function createDiscoverySourceRegistry(catalog) {
    const entries = [...catalog];
    return deepFreeze({
        getAll: () => entries,
        getByKey: (key) => byKey(entries, key),
        getByRole: (role) => byRole(entries, role),
        getByTier: (tier) => byTier(entries, tier),
        getByGeoScope: (geoScope) => byGeoScope(entries, geoScope),
        getByStatus: (status) => byStatus(entries, status),
    });
}
/** Default registry instance with initial Italian-first catalog. */
export const discoverySourceRegistry = createDiscoverySourceRegistry(INITIAL_DISCOVERY_SOURCE_CATALOG);
//# sourceMappingURL=discovery-source-registry.js.map