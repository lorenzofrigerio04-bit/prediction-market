import type { OverrideRequest } from "../entities/override-request.entity.js";
import type { OverrideRequestId } from "../../value-objects/admin-governance-ids.vo.js";
import type { ActorRef } from "../../value-objects/actor-ref.vo.js";
import type { OverrideStatus } from "../../enums/override-status.enum.js";
export interface OverrideManager {
    submit(request: OverrideRequest): OverrideRequest;
    resolve(requestId: OverrideRequestId, status: OverrideStatus, resolvedBy: ActorRef): OverrideRequest | null;
    getById(requestId: OverrideRequestId): OverrideRequest | null;
}
//# sourceMappingURL=override-manager.d.ts.map