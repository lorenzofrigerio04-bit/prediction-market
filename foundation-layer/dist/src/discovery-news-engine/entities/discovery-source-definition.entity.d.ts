import { DiscoverySourceAuthMode } from "../enums/discovery-auth-mode.enum.js";
import { DiscoveryGeoScope } from "../enums/discovery-geo-scope.enum.js";
import { DiscoverySourceKind } from "../enums/discovery-source-kind.enum.js";
import { DiscoveryPollingHint } from "../enums/discovery-polling-hint.enum.js";
import { DiscoverySourceStatus } from "../enums/discovery-source-status.enum.js";
import { DiscoverySourceTier } from "../enums/discovery-source-tier.enum.js";
import { DiscoveryTopicScope } from "../enums/discovery-topic-scope.enum.js";
import { DiscoveryTrustTier } from "../enums/discovery-trust-tier.enum.js";
import type { DiscoverySourceUsageRole } from "../enums/discovery-source-usage-role.enum.js";
import type { DiscoverySourceEndpoint } from "./discovery-source-endpoint.entity.js";
import type { DiscoverySourceId } from "../value-objects/discovery-source-id.vo.js";
import type { DiscoverySourceKey } from "../value-objects/discovery-source-key.vo.js";
import type { SourceDefinitionId } from "../../sources/value-objects/source-definition-id.vo.js";
export type DiscoverySourceDefinition = Readonly<{
    id: DiscoverySourceId;
    key: DiscoverySourceKey;
    kind: DiscoverySourceKind;
    tier: DiscoverySourceTier;
    status: DiscoverySourceStatus;
    pollingHint: DiscoveryPollingHint;
    geoScope: DiscoveryGeoScope;
    topicScope: DiscoveryTopicScope;
    trustTier: DiscoveryTrustTier;
    endpoint: DiscoverySourceEndpoint;
    authMode: DiscoverySourceAuthMode;
    sourceDefinitionIdNullable: SourceDefinitionId | null;
    roleNullable: DiscoverySourceUsageRole | null;
}>;
export type DiscoverySourceDefinitionInput = Omit<DiscoverySourceDefinition, "roleNullable"> & {
    roleNullable?: DiscoverySourceUsageRole | null;
};
export declare const createDiscoverySourceDefinition: (input: DiscoverySourceDefinitionInput) => DiscoverySourceDefinition;
//# sourceMappingURL=discovery-source-definition.entity.d.ts.map