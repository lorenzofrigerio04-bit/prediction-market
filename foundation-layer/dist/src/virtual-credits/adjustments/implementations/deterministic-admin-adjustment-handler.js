import { AppliedStatus } from "../../enums/applied-status.enum.js";
export class DeterministicAdminAdjustmentHandler {
    byId = new Map();
    proposeAdjustment(adjustment) {
        this.byId.set(adjustment.id, adjustment);
        return adjustment;
    }
    applyAdjustment(adjustmentId) {
        const existing = this.byId.get(adjustmentId);
        if (existing === undefined) {
            return null;
        }
        const updated = { ...existing, applied_status: AppliedStatus.APPLIED };
        this.byId.set(adjustmentId, updated);
        return updated;
    }
    rejectAdjustment(adjustmentId) {
        const existing = this.byId.get(adjustmentId);
        if (existing === undefined) {
            return null;
        }
        const updated = { ...existing, applied_status: AppliedStatus.REJECTED };
        this.byId.set(adjustmentId, updated);
        return updated;
    }
}
//# sourceMappingURL=deterministic-admin-adjustment-handler.js.map