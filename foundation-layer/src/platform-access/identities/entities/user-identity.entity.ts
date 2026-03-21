import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { UserStatus } from "../../enums/user-status.enum.js";
import { UserType } from "../../enums/user-type.enum.js";
import type { UserIdentityId, WorkspaceId } from "../../value-objects/platform-access-ids.vo.js";
import type { DisplayName } from "../../value-objects/display-name.vo.js";
import type { CapabilityFlagKey } from "../../value-objects/capability-flag-key.vo.js";
import type { VersionTag } from "../../value-objects/version-tag.vo.js";

export type UserIdentity = Readonly<{
  id: UserIdentityId;
  version: VersionTag;
  user_type: UserType;
  display_name: DisplayName;
  status: UserStatus;
  primary_workspace_id_nullable: WorkspaceId | null;
  capability_flags: readonly CapabilityFlagKey[];
  metadata: Readonly<Record<string, unknown>>;
}>;

export const createUserIdentity = (input: UserIdentity): UserIdentity => {
  if (!Object.values(UserType).includes(input.user_type)) {
    throw new ValidationError("INVALID_USER_IDENTITY", "user_type is invalid");
  }
  if (!Object.values(UserStatus).includes(input.status)) {
    throw new ValidationError("INVALID_USER_IDENTITY", "status is invalid");
  }
  return deepFreeze({
    ...input,
    capability_flags: deepFreeze([...input.capability_flags]),
    metadata: deepFreeze({ ...input.metadata }),
  });
};
