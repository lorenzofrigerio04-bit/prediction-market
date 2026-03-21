import type { UserIdentity } from "../entities/user-identity.entity.js";
import type { UserIdentityId } from "../../value-objects/platform-access-ids.vo.js";
export interface UserIdentityReader {
    getById(userId: UserIdentityId): UserIdentity | null;
}
//# sourceMappingURL=user-identity-reader.d.ts.map