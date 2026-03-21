import type { AccessScope } from "../entities/access-scope.entity.js";
import type { UserIdentityId } from "../../value-objects/platform-access-ids.vo.js";

export interface AccessScopeResolver {
  listForUser(userId: UserIdentityId): readonly AccessScope[];
}
