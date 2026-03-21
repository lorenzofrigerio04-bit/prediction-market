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
export declare const createUserIdentity: (input: UserIdentity) => UserIdentity;
//# sourceMappingURL=user-identity.entity.d.ts.map