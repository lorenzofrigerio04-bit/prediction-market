import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { OverrideStatus } from "../../enums/override-status.enum.js";
import type {
  ActorRef,
  AuditRef,
  Metadata,
  ModuleKey,
  Note,
  OperationKey,
  OverrideRequestId,
  VersionTag,
} from "../../value-objects/index.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";

export type OverrideRequest = Readonly<{
  id: OverrideRequestId;
  version: VersionTag;
  module_key: ModuleKey;
  operation_key: OperationKey;
  requested_by: ActorRef;
  reason: Note;
  status: OverrideStatus;
  requested_at: Timestamp;
  expires_at_nullable: Timestamp | null;
  resolved_by_nullable: ActorRef | null;
  audit_ref: AuditRef;
  metadata: Metadata;
}>;

export const createOverrideRequest = (input: OverrideRequest): OverrideRequest => deepFreeze({ ...input });
