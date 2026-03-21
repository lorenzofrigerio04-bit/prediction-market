import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { GrantStatus } from "../../enums/grant-status.enum.js";
import { GrantType } from "../../enums/grant-type.enum.js";
import type { CreditGrantId, GrantReason, RelatedRef, Version, VirtualCreditAccountId } from "../../value-objects/index.js";

export type CreditGrant = Readonly<{
  id: CreditGrantId;
  version: Version;
  target_account_id: VirtualCreditAccountId;
  grant_type: GrantType;
  amount: number;
  issued_by: RelatedRef;
  issued_at: Timestamp;
  expiration_nullable: Timestamp | null;
  grant_reason: GrantReason;
  grant_status: GrantStatus;
  source_policy_ref_nullable: RelatedRef | null;
}>;

export const createCreditGrant = (input: CreditGrant): CreditGrant => deepFreeze({ ...input });
