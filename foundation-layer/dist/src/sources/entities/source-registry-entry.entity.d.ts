import { AuthenticationMode } from "../enums/authentication-mode.enum.js";
import { SourceHealthStatus } from "../enums/source-health-status.enum.js";
import type { AuditMetadata } from "../value-objects/audit-metadata.vo.js";
import type { PollingPolicy } from "../value-objects/polling-policy.vo.js";
import type { RateLimitProfile } from "../value-objects/rate-limit-profile.vo.js";
import type { SourceDefinitionId } from "../value-objects/source-definition-id.vo.js";
export type SourceRegistryEntry = Readonly<{
    sourceDefinitionId: SourceDefinitionId;
    pollingPolicyNullable: PollingPolicy | null;
    rateLimitProfileNullable: RateLimitProfile | null;
    authenticationMode: AuthenticationMode;
    healthStatus: SourceHealthStatus;
    ownerNotesNullable: string | null;
    auditMetadata: AuditMetadata;
}>;
export declare const createSourceRegistryEntry: (input: SourceRegistryEntry) => SourceRegistryEntry;
//# sourceMappingURL=source-registry-entry.entity.d.ts.map