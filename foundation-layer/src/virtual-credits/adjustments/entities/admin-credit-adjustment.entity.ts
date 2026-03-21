import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { AdjustmentType } from "../../enums/adjustment-type.enum.js";
import { AppliedStatus } from "../../enums/applied-status.enum.js";
import type {
  AdminCreditAdjustmentId,
  AdjustmentReason,
  AuditRef,
  RelatedRef,
  Version,
  VirtualCreditAccountId,
} from "../../value-objects/index.js";

export type AdminCreditAdjustment = Readonly<{
  id: AdminCreditAdjustmentId;
  version: Version;
  target_account_id: VirtualCreditAccountId;
  adjustment_type: AdjustmentType;
  amount_delta: number;
  initiated_by: RelatedRef;
  initiated_at: Timestamp;
  adjustment_reason: AdjustmentReason;
  audit_ref: AuditRef;
  applied_status: AppliedStatus;
}>;

export const createAdminCreditAdjustment = (input: AdminCreditAdjustment): AdminCreditAdjustment =>
  deepFreeze({ ...input });
