import { DiscoverySourceAuthMode } from "../enums/discovery-auth-mode.enum.js";
import { DiscoverySourceCapability } from "../enums/discovery-source-capability.enum.js";
import { DiscoveryGeoScope } from "../enums/discovery-geo-scope.enum.js";
import { DiscoverySourceKind } from "../enums/discovery-source-kind.enum.js";
import { DiscoveryPollingHint } from "../enums/discovery-polling-hint.enum.js";
import { DiscoverySourceStatus } from "../enums/discovery-source-status.enum.js";
import { DiscoverySourceTier } from "../enums/discovery-source-tier.enum.js";
import { DiscoveryTopicScope } from "../enums/discovery-topic-scope.enum.js";
import { DiscoveryTrustTier } from "../enums/discovery-trust-tier.enum.js";
import { DiscoverySourceUsageRole } from "../enums/discovery-source-usage-role.enum.js";
import type { DiscoverySourceEndpoint } from "./discovery-source-endpoint.entity.js";
import type { DiscoverySourceDefinition } from "./discovery-source-definition.entity.js";
import type { DiscoverySourceId } from "../value-objects/discovery-source-id.vo.js";
import type { DiscoverySourceKey } from "../value-objects/discovery-source-key.vo.js";
import type { DiscoveryScheduleHint } from "../value-objects/discovery-schedule-hint.vo.js";
import type { SourceDefinitionId } from "../../sources/value-objects/source-definition-id.vo.js";
/**
 * Registry row type: definition fields plus catalog-only metadata.
 * Single canonical shape for the Discovery Source Registry.
 */
export type DiscoverySourceCatalogEntry = Readonly<{
    id: DiscoverySourceId;
    key: DiscoverySourceKey;
    name: string;
    kind: DiscoverySourceKind;
    tier: DiscoverySourceTier;
    status: DiscoverySourceStatus;
    role: DiscoverySourceUsageRole;
    pollingHint: DiscoveryPollingHint;
    geoScope: DiscoveryGeoScope;
    topicScope: DiscoveryTopicScope;
    trustTier: DiscoveryTrustTier;
    endpoint: DiscoverySourceEndpoint;
    authMode: DiscoverySourceAuthMode;
    sourceDefinitionIdNullable: SourceDefinitionId | null;
    scheduleHint: DiscoveryScheduleHint;
    descriptionNullable: string | null;
    capabilities: readonly DiscoverySourceCapability[];
}>;
export declare const createDiscoverySourceCatalogEntry: (input: DiscoverySourceCatalogEntry) => DiscoverySourceCatalogEntry;
/**
 * Derives the runtime-facing DiscoverySourceDefinition from a catalog entry.
 * Used when building runs/jobs from the registry.
 */
export declare const catalogEntryToSourceDefinition: (entry: DiscoverySourceCatalogEntry) => DiscoverySourceDefinition;
//# sourceMappingURL=discovery-source-catalog-entry.entity.d.ts.map