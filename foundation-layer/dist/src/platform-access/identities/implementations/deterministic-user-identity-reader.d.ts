import type { UserIdentity } from "../entities/user-identity.entity.js";
import type { UserIdentityReader } from "../interfaces/user-identity-reader.js";
import type { UserIdentityId } from "../../value-objects/platform-access-ids.vo.js";
export declare class DeterministicUserIdentityReader implements UserIdentityReader {
    private readonly byId;
    constructor(users: readonly UserIdentity[]);
    getById(userId: UserIdentityId): UserIdentity | null;
}
//# sourceMappingURL=deterministic-user-identity-reader.d.ts.map