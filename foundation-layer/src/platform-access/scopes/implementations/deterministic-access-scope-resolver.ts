import type { AccessScope } from "../entities/access-scope.entity.js";
import type { AccessScopeResolver } from "../interfaces/access-scope-resolver.js";
import type { UserIdentityId } from "../../value-objects/platform-access-ids.vo.js";

export class DeterministicAccessScopeResolver implements AccessScopeResolver {
  private readonly byUser: ReadonlyMap<UserIdentityId, readonly AccessScope[]>;

  constructor(scopes_by_user: ReadonlyMap<UserIdentityId, readonly AccessScope[]>) {
    const cloned = new Map<UserIdentityId, readonly AccessScope[]>();
    for (const [userId, scopes] of scopes_by_user.entries()) {
      cloned.set(userId, [...scopes]);
    }
    this.byUser = cloned;
  }

  listForUser(userId: UserIdentityId): readonly AccessScope[] {
    return this.byUser.get(userId) ?? [];
  }
}
