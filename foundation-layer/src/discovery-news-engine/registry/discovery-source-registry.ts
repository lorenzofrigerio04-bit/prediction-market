/**
 * Discovery Source Registry – immutable in-memory registry.
 * Single canonical list of discovery sources; access by key, role, tier, geo, status.
 */

import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { DiscoverySourceCatalogEntry } from "../entities/discovery-source-catalog-entry.entity.js";
import type { DiscoverySourceKey } from "../value-objects/discovery-source-key.vo.js";
import { DiscoveryGeoScope } from "../enums/discovery-geo-scope.enum.js";
import { DiscoverySourceStatus } from "../enums/discovery-source-status.enum.js";
import { DiscoverySourceTier } from "../enums/discovery-source-tier.enum.js";
import { DiscoverySourceUsageRole } from "../enums/discovery-source-usage-role.enum.js";
import { INITIAL_DISCOVERY_SOURCE_CATALOG } from "./discovery-source-catalog.js";

export type DiscoverySourceRegistry = Readonly<{
  getAll(): readonly DiscoverySourceCatalogEntry[];
  getByKey(key: DiscoverySourceKey | string): DiscoverySourceCatalogEntry | undefined;
  getByRole(role: DiscoverySourceUsageRole): readonly DiscoverySourceCatalogEntry[];
  getByTier(tier: DiscoverySourceTier): readonly DiscoverySourceCatalogEntry[];
  getByGeoScope(geoScope: DiscoveryGeoScope): readonly DiscoverySourceCatalogEntry[];
  getByStatus(status: DiscoverySourceStatus): readonly DiscoverySourceCatalogEntry[];
}>;

function byKey(entries: readonly DiscoverySourceCatalogEntry[], key: DiscoverySourceKey | string) {
  const k = typeof key === "string" ? key : (key as string);
  return entries.find((e) => (e.key as string) === k);
}

function byRole(entries: readonly DiscoverySourceCatalogEntry[], role: DiscoverySourceUsageRole) {
  return entries.filter((e) => e.role === role);
}

function byTier(entries: readonly DiscoverySourceCatalogEntry[], tier: DiscoverySourceTier) {
  return entries.filter((e) => e.tier === tier);
}

function byGeoScope(
  entries: readonly DiscoverySourceCatalogEntry[],
  geoScope: DiscoveryGeoScope,
) {
  return entries.filter((e) => e.geoScope === geoScope);
}

function byStatus(
  entries: readonly DiscoverySourceCatalogEntry[],
  status: DiscoverySourceStatus,
) {
  return entries.filter((e) => e.status === status);
}

/**
 * Builds an immutable registry from a catalog array.
 * Keys must be unique; duplicate keys are not checked here (validate at catalog build time).
 */
export function createDiscoverySourceRegistry(
  catalog: readonly DiscoverySourceCatalogEntry[],
): DiscoverySourceRegistry {
  const entries = [...catalog];
  return deepFreeze({
    getAll: () => entries,
    getByKey: (key: DiscoverySourceKey | string) => byKey(entries, key),
    getByRole: (role: DiscoverySourceUsageRole) => byRole(entries, role),
    getByTier: (tier: DiscoverySourceTier) => byTier(entries, tier),
    getByGeoScope: (geoScope: DiscoveryGeoScope) => byGeoScope(entries, geoScope),
    getByStatus: (status: DiscoverySourceStatus) => byStatus(entries, status),
  });
}

/** Default registry instance with initial Italian-first catalog. */
export const discoverySourceRegistry: DiscoverySourceRegistry =
  createDiscoverySourceRegistry(INITIAL_DISCOVERY_SOURCE_CATALOG);
