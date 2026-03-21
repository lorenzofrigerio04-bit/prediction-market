import type { Timestamp } from "../../value-objects/timestamp.vo.js";
import type { DiscoverySourceId } from "../value-objects/discovery-source-id.vo.js";
import type { DiscoverySourceKey } from "../value-objects/discovery-source-key.vo.js";
import type { DiscoveryRunId } from "../value-objects/discovery-run-id.vo.js";
import type { DiscoverySourceTier } from "../enums/discovery-source-tier.enum.js";
import type { DiscoverySourceUsageRole } from "../enums/discovery-source-usage-role.enum.js";
import type { DiscoveryTrustTier } from "../enums/discovery-trust-tier.enum.js";
import type { DiscoverySourceDefinition } from "./discovery-source-definition.entity.js";
import type { DiscoveryTransportMetadata } from "./discovery-transport-metadata.entity.js";
/** Subset of transport metadata relevant to provenance (fetch audit). */
export type DiscoveryFetchMetadata = Readonly<{
    statusCodeNullable: number | null;
    etagNullable: string | null;
}>;
export declare const createDiscoveryFetchMetadata: (input: DiscoveryFetchMetadata) => DiscoveryFetchMetadata;
export type DiscoveryProvenanceMetadata = Readonly<{
    fetchedAt: Timestamp;
    sourceDefinitionId: DiscoverySourceId;
    runIdNullable: DiscoveryRunId | null;
    sourceKey: DiscoverySourceKey;
    sourceRoleNullable: DiscoverySourceUsageRole | null;
    sourceTier: DiscoverySourceTier;
    trustTier: DiscoveryTrustTier;
    endpointReferenceNullable: string | null;
    adapterKeyNullable: string | null;
    fetchMetadataNullable: DiscoveryFetchMetadata | null;
}>;
export declare const createDiscoveryProvenanceMetadata: (input: DiscoveryProvenanceMetadata) => DiscoveryProvenanceMetadata;
export type BuildProvenanceMetadataOptions = Readonly<{
    transportMetadata?: DiscoveryTransportMetadata;
    adapterKey?: string;
}>;
/**
 * Builds enriched DiscoveryProvenanceMetadata from definition, fetch time, run id, and optional fetch/adapter context.
 * Use in normalizers and connector-run so provenance is consistent.
 */
export declare function buildDiscoveryProvenanceMetadata(definition: DiscoverySourceDefinition, fetchedAt: Timestamp, runIdNullable: DiscoveryRunId | null, options?: BuildProvenanceMetadataOptions): DiscoveryProvenanceMetadata;
//# sourceMappingURL=discovery-provenance-metadata.entity.d.ts.map