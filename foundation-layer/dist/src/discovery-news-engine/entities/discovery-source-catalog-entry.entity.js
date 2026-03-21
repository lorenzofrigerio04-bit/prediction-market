import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoverySourceCatalogEntry = (input) => deepFreeze({ ...input });
/**
 * Derives the runtime-facing DiscoverySourceDefinition from a catalog entry.
 * Used when building runs/jobs from the registry.
 */
export const catalogEntryToSourceDefinition = (entry) => ({
    id: entry.id,
    key: entry.key,
    kind: entry.kind,
    tier: entry.tier,
    status: entry.status,
    pollingHint: entry.pollingHint,
    geoScope: entry.geoScope,
    topicScope: entry.topicScope,
    trustTier: entry.trustTier,
    endpoint: entry.endpoint,
    authMode: entry.authMode,
    sourceDefinitionIdNullable: entry.sourceDefinitionIdNullable,
    roleNullable: entry.role,
});
//# sourceMappingURL=discovery-source-catalog-entry.entity.js.map