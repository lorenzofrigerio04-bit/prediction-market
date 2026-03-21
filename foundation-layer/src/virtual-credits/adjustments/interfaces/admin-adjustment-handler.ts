import type { AdminCreditAdjustment } from "../entities/admin-credit-adjustment.entity.js";
import type { AdminCreditAdjustmentId } from "../../value-objects/index.js";

export interface AdminAdjustmentHandler {
  proposeAdjustment(adjustment: AdminCreditAdjustment): AdminCreditAdjustment;
  applyAdjustment(adjustmentId: AdminCreditAdjustmentId): AdminCreditAdjustment | null;
  rejectAdjustment(adjustmentId: AdminCreditAdjustmentId, reason: string): AdminCreditAdjustment | null;
}
