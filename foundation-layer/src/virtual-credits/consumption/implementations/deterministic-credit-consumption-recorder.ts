import { ConsumptionStatus } from "../../enums/consumption-status.enum.js";
import { createNote, type CreditConsumptionEventId } from "../../value-objects/index.js";
import type { CreditConsumptionEvent } from "../entities/credit-consumption-event.entity.js";
import type { CreditConsumptionRecorder } from "../interfaces/credit-consumption-recorder.js";

export class DeterministicCreditConsumptionRecorder implements CreditConsumptionRecorder {
  private readonly byId = new Map<CreditConsumptionEventId, CreditConsumptionEvent>();

  recordPendingConsumption(event: CreditConsumptionEvent): CreditConsumptionEvent {
    const normalized: CreditConsumptionEvent = { ...event, consumption_status: ConsumptionStatus.PENDING };
    this.byId.set(event.id, normalized);
    return normalized;
  }

  completeConsumption(eventId: CreditConsumptionEventId): CreditConsumptionEvent | null {
    const existing = this.byId.get(eventId);
    if (existing === undefined) {
      return null;
    }
    const updated: CreditConsumptionEvent = { ...existing, consumption_status: ConsumptionStatus.COMPLETED };
    this.byId.set(eventId, updated);
    return updated;
  }

  rejectConsumption(eventId: CreditConsumptionEventId, reason: string): CreditConsumptionEvent | null {
    const existing = this.byId.get(eventId);
    if (existing === undefined) {
      return null;
    }
    const updated: CreditConsumptionEvent = {
      ...existing,
      consumption_status: ConsumptionStatus.REJECTED,
      notes_nullable: createNote(reason),
    };
    this.byId.set(eventId, updated);
    return updated;
  }

  reverseConsumption(eventId: CreditConsumptionEventId, reason: string): CreditConsumptionEvent | null {
    const existing = this.byId.get(eventId);
    if (existing === undefined) {
      return null;
    }
    const updated: CreditConsumptionEvent = {
      ...existing,
      consumption_status: ConsumptionStatus.REVERSED,
      notes_nullable: createNote(reason),
    };
    this.byId.set(eventId, updated);
    return updated;
  }
}
