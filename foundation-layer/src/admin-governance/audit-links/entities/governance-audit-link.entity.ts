import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { AuditLinkType } from "../../enums/audit-link-type.enum.js";
import type {
  AuditRef,
  GovernanceAuditLinkId,
  GovernanceDecisionId,
  Metadata,
  OverrideRequestId,
  VersionTag,
} from "../../value-objects/index.js";

export type GovernanceAuditLink = Readonly<{
  id: GovernanceAuditLinkId;
  version: VersionTag;
  audit_ref: AuditRef;
  link_type: AuditLinkType;
  decision_ref_nullable: GovernanceDecisionId | null;
  override_ref_nullable: OverrideRequestId | null;
  metadata: Metadata;
}>;

export const createGovernanceAuditLink = (input: GovernanceAuditLink): GovernanceAuditLink => deepFreeze({ ...input });
