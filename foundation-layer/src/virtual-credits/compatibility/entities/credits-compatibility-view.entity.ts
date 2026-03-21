import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ConsistencyStatus } from "../../enums/consistency-status.enum.js";
import type { ActionKey, Note, OwnerRef, RelatedRef, VirtualCreditAccountId } from "../../value-objects/index.js";

export type CreditsCompatibilityView = Readonly<{
  id: RelatedRef;
  owner_ref: OwnerRef;
  access_scope_ref: RelatedRef;
  account_ref_nullable: VirtualCreditAccountId | null;
  visible_balance_nullable: number | null;
  active_quota_refs: readonly RelatedRef[];
  active_risk_flags: readonly RelatedRef[];
  allowed_actions: readonly ActionKey[];
  warnings: readonly Note[];
  compatibility_status: ConsistencyStatus;
}>;

export const createCreditsCompatibilityView = (input: CreditsCompatibilityView): CreditsCompatibilityView =>
  deepFreeze({ ...input });
