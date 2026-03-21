import { AppliedStatus } from "../../enums/applied-status.enum.js";
import type { AdminCreditAdjustmentId } from "../../value-objects/index.js";
import type { AdminCreditAdjustment } from "../entities/admin-credit-adjustment.entity.js";
import type { AdminAdjustmentHandler } from "../interfaces/admin-adjustment-handler.js";

export class DeterministicAdminAdjustmentHandler implements AdminAdjustmentHandler {
  private readonly byId = new Map<AdminCreditAdjustmentId, AdminCreditAdjustment>();

  proposeAdjustment(adjustment: AdminCreditAdjustment): AdminCreditAdjustment {
    this.byId.set(adjustment.id, adjustment);
    return adjustment;
  }

  applyAdjustment(adjustmentId: AdminCreditAdjustmentId): AdminCreditAdjustment | null {
    const existing = this.byId.get(adjustmentId);
    if (existing === undefined) {
      return null;
    }
    const updated = { ...existing, applied_status: AppliedStatus.APPLIED };
    this.byId.set(adjustmentId, updated);
    return updated;
  }

  rejectAdjustment(adjustmentId: AdminCreditAdjustmentId): AdminCreditAdjustment | null {
    const existing = this.byId.get(adjustmentId);
    if (existing === undefined) {
      return null;
    }
    const updated = { ...existing, applied_status: AppliedStatus.REJECTED };
    this.byId.set(adjustmentId, updated);
    return updated;
  }
}
