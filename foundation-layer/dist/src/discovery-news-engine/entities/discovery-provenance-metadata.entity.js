import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoveryFetchMetadata = (input) => deepFreeze({
    statusCodeNullable: input.statusCodeNullable ?? null,
    etagNullable: input.etagNullable ?? null,
});
export const createDiscoveryProvenanceMetadata = (input) => deepFreeze({
    ...input,
    runIdNullable: input.runIdNullable ?? null,
    sourceRoleNullable: input.sourceRoleNullable ?? null,
    endpointReferenceNullable: input.endpointReferenceNullable ?? null,
    adapterKeyNullable: input.adapterKeyNullable ?? null,
    fetchMetadataNullable: input.fetchMetadataNullable ?? null,
});
/**
 * Builds enriched DiscoveryProvenanceMetadata from definition, fetch time, run id, and optional fetch/adapter context.
 * Use in normalizers and connector-run so provenance is consistent.
 */
export function buildDiscoveryProvenanceMetadata(definition, fetchedAt, runIdNullable, options) {
    const transport = options?.transportMetadata;
    const fetchMetadataNullable = transport != null
        ? createDiscoveryFetchMetadata({
            statusCodeNullable: transport.statusCodeNullable ?? null,
            etagNullable: transport.etagNullable ?? null,
        })
        : null;
    return createDiscoveryProvenanceMetadata({
        fetchedAt,
        sourceDefinitionId: definition.id,
        runIdNullable,
        sourceKey: definition.key,
        sourceRoleNullable: definition.roleNullable ?? null,
        sourceTier: definition.tier,
        trustTier: definition.trustTier,
        endpointReferenceNullable: definition.endpoint?.url ?? null,
        adapterKeyNullable: options?.adapterKey ?? null,
        fetchMetadataNullable,
    });
}
//# sourceMappingURL=discovery-provenance-metadata.entity.js.map