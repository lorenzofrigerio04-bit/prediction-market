import { deepFreeze } from "../../common/utils/deep-freeze.js";
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

export const createDiscoveryFetchMetadata = (
  input: DiscoveryFetchMetadata,
): DiscoveryFetchMetadata =>
  deepFreeze({
    statusCodeNullable: input.statusCodeNullable ?? null,
    etagNullable: input.etagNullable ?? null,
  });

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

export const createDiscoveryProvenanceMetadata = (
  input: DiscoveryProvenanceMetadata,
): DiscoveryProvenanceMetadata =>
  deepFreeze({
    ...input,
    runIdNullable: input.runIdNullable ?? null,
    sourceRoleNullable: input.sourceRoleNullable ?? null,
    endpointReferenceNullable: input.endpointReferenceNullable ?? null,
    adapterKeyNullable: input.adapterKeyNullable ?? null,
    fetchMetadataNullable: input.fetchMetadataNullable ?? null,
  });

export type BuildProvenanceMetadataOptions = Readonly<{
  transportMetadata?: DiscoveryTransportMetadata;
  adapterKey?: string;
}>;

/**
 * Builds enriched DiscoveryProvenanceMetadata from definition, fetch time, run id, and optional fetch/adapter context.
 * Use in normalizers and connector-run so provenance is consistent.
 */
export function buildDiscoveryProvenanceMetadata(
  definition: DiscoverySourceDefinition,
  fetchedAt: Timestamp,
  runIdNullable: DiscoveryRunId | null,
  options?: BuildProvenanceMetadataOptions,
): DiscoveryProvenanceMetadata {
  const transport = options?.transportMetadata;
  const fetchMetadataNullable =
    transport != null
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
