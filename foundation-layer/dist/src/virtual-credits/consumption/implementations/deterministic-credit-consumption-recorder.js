import { ConsumptionStatus } from "../../enums/consumption-status.enum.js";
import { createNote } from "../../value-objects/index.js";
export class DeterministicCreditConsumptionRecorder {
    byId = new Map();
    recordPendingConsumption(event) {
        const normalized = { ...event, consumption_status: ConsumptionStatus.PENDING };
        this.byId.set(event.id, normalized);
        return normalized;
    }
    completeConsumption(eventId) {
        const existing = this.byId.get(eventId);
        if (existing === undefined) {
            return null;
        }
        const updated = { ...existing, consumption_status: ConsumptionStatus.COMPLETED };
        this.byId.set(eventId, updated);
        return updated;
    }
    rejectConsumption(eventId, reason) {
        const existing = this.byId.get(eventId);
        if (existing === undefined) {
            return null;
        }
        const updated = {
            ...existing,
            consumption_status: ConsumptionStatus.REJECTED,
            notes_nullable: createNote(reason),
        };
        this.byId.set(eventId, updated);
        return updated;
    }
    reverseConsumption(eventId, reason) {
        const existing = this.byId.get(eventId);
        if (existing === undefined) {
            return null;
        }
        const updated = {
            ...existing,
            consumption_status: ConsumptionStatus.REVERSED,
            notes_nullable: createNote(reason),
        };
        this.byId.set(eventId, updated);
        return updated;
    }
}
//# sourceMappingURL=deterministic-credit-consumption-recorder.js.map