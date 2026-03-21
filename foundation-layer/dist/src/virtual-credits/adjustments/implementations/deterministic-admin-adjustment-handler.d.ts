import type { AdminCreditAdjustmentId } from "../../value-objects/index.js";
import type { AdminCreditAdjustment } from "../entities/admin-credit-adjustment.entity.js";
import type { AdminAdjustmentHandler } from "../interfaces/admin-adjustment-handler.js";
export declare class DeterministicAdminAdjustmentHandler implements AdminAdjustmentHandler {
    private readonly byId;
    proposeAdjustment(adjustment: AdminCreditAdjustment): AdminCreditAdjustment;
    applyAdjustment(adjustmentId: AdminCreditAdjustmentId): AdminCreditAdjustment | null;
    rejectAdjustment(adjustmentId: AdminCreditAdjustmentId): AdminCreditAdjustment | null;
}
//# sourceMappingURL=deterministic-admin-adjustment-handler.d.ts.map