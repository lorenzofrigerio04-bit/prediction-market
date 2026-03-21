import type { OverrideRequestId } from "../../value-objects/admin-governance-ids.vo.js";
import type { ActorRef } from "../../value-objects/actor-ref.vo.js";
import type { OverrideStatus } from "../../enums/override-status.enum.js";
import type { OverrideRequest } from "../entities/override-request.entity.js";
import type { OverrideManager } from "../interfaces/override-manager.js";

export class DeterministicOverrideManager implements OverrideManager {
  private readonly byId = new Map<OverrideRequestId, OverrideRequest>();

  submit(request: OverrideRequest): OverrideRequest {
    this.byId.set(request.id, request);
    return request;
  }

  resolve(requestId: OverrideRequestId, status: OverrideStatus, resolvedBy: ActorRef): OverrideRequest | null {
    const existing = this.byId.get(requestId);
    if (existing === undefined) {
      return null;
    }
    const updated: OverrideRequest = {
      ...existing,
      status,
      resolved_by_nullable: resolvedBy,
    };
    this.byId.set(requestId, updated);
    return updated;
  }

  getById(requestId: OverrideRequestId): OverrideRequest | null {
    return this.byId.get(requestId) ?? null;
  }
}
