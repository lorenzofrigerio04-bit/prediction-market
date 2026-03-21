import type { AccessScope } from "../entities/access-scope.entity.js";
import type { AccessScopeResolver } from "../interfaces/access-scope-resolver.js";
import type { UserIdentityId } from "../../value-objects/platform-access-ids.vo.js";
export declare class DeterministicAccessScopeResolver implements AccessScopeResolver {
    private readonly byUser;
    constructor(scopes_by_user: ReadonlyMap<UserIdentityId, readonly AccessScope[]>);
    listForUser(userId: UserIdentityId): readonly AccessScope[];
}
//# sourceMappingURL=deterministic-access-scope-resolver.d.ts.map