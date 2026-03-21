/**
 * Discovery Source Registry – immutable in-memory registry.
 * Single canonical list of discovery sources; access by key, role, tier, geo, status.
 */
import type { DiscoverySourceCatalogEntry } from "../entities/discovery-source-catalog-entry.entity.js";
import type { DiscoverySourceKey } from "../value-objects/discovery-source-key.vo.js";
import { DiscoveryGeoScope } from "../enums/discovery-geo-scope.enum.js";
import { DiscoverySourceStatus } from "../enums/discovery-source-status.enum.js";
import { DiscoverySourceTier } from "../enums/discovery-source-tier.enum.js";
import { DiscoverySourceUsageRole } from "../enums/discovery-source-usage-role.enum.js";
export type DiscoverySourceRegistry = Readonly<{
    getAll(): readonly DiscoverySourceCatalogEntry[];
    getByKey(key: DiscoverySourceKey | string): DiscoverySourceCatalogEntry | undefined;
    getByRole(role: DiscoverySourceUsageRole): readonly DiscoverySourceCatalogEntry[];
    getByTier(tier: DiscoverySourceTier): readonly DiscoverySourceCatalogEntry[];
    getByGeoScope(geoScope: DiscoveryGeoScope): readonly DiscoverySourceCatalogEntry[];
    getByStatus(status: DiscoverySourceStatus): readonly DiscoverySourceCatalogEntry[];
}>;
/**
 * Builds an immutable registry from a catalog array.
 * Keys must be unique; duplicate keys are not checked here (validate at catalog build time).
 */
export declare function createDiscoverySourceRegistry(catalog: readonly DiscoverySourceCatalogEntry[]): DiscoverySourceRegistry;
/** Default registry instance with initial Italian-first catalog. */
export declare const discoverySourceRegistry: DiscoverySourceRegistry;
//# sourceMappingURL=discovery-source-registry.d.ts.map