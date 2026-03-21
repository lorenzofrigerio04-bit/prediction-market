import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { EmergencyState } from "../../enums/emergency-state.enum.js";
import type { ActorRef, EmergencyControlId, Metadata, ModuleKey, Note, VersionTag } from "../../value-objects/index.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";

export type EmergencyControl = Readonly<{
  id: EmergencyControlId;
  version: VersionTag;
  module_key: ModuleKey;
  state: EmergencyState;
  reason: Note;
  activated_by: ActorRef;
  activated_at: Timestamp;
  expires_at_nullable: Timestamp | null;
  metadata: Metadata;
}>;

export const createEmergencyControl = (input: EmergencyControl): EmergencyControl => deepFreeze({ ...input });
