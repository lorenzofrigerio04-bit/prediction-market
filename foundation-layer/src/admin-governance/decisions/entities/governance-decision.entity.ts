import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { GovernanceDecisionStatus } from "../../enums/governance-decision-status.enum.js";
import type {
  ActorRef,
  AuditRef,
  GovernanceDecisionId,
  GovernanceModuleId,
  Metadata,
  Note,
  OperationKey,
  VersionTag,
} from "../../value-objects/index.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";

export type GovernanceDecision = Readonly<{
  id: GovernanceDecisionId;
  version: VersionTag;
  module_id: GovernanceModuleId;
  operation_key: OperationKey;
  status: GovernanceDecisionStatus;
  decided_by: ActorRef;
  decided_at: Timestamp;
  audit_ref: AuditRef;
  reasons: readonly Note[];
  metadata: Metadata;
}>;

export const createGovernanceDecision = (input: GovernanceDecision): GovernanceDecision => deepFreeze({ ...input });
