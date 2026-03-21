import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
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

export const createSourceRegistryEntry = (input: SourceRegistryEntry): SourceRegistryEntry => {
  const ownerNotesNullable =
    input.ownerNotesNullable === null ? null : input.ownerNotesNullable.trim();
  if (ownerNotesNullable !== null && ownerNotesNullable.length === 0) {
    throw new ValidationError(
      "INVALID_SOURCE_REGISTRY_ENTRY",
      "ownerNotesNullable cannot be empty when provided",
    );
  }
  return deepFreeze({
    sourceDefinitionId: input.sourceDefinitionId,
    pollingPolicyNullable: input.pollingPolicyNullable,
    rateLimitProfileNullable: input.rateLimitProfileNullable,
    authenticationMode: input.authenticationMode,
    healthStatus: input.healthStatus,
    ownerNotesNullable,
    auditMetadata: input.auditMetadata,
  });
};
