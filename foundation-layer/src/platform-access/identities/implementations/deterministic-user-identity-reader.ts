import type { UserIdentity } from "../entities/user-identity.entity.js";
import type { UserIdentityReader } from "../interfaces/user-identity-reader.js";
import type { UserIdentityId } from "../../value-objects/platform-access-ids.vo.js";

export class DeterministicUserIdentityReader implements UserIdentityReader {
  private readonly byId: ReadonlyMap<UserIdentityId, UserIdentity>;

  constructor(users: readonly UserIdentity[]) {
    this.byId = new Map(users.map((user) => [user.id, user]));
  }

  getById(userId: UserIdentityId): UserIdentity | null {
    return this.byId.get(userId) ?? null;
  }
}
