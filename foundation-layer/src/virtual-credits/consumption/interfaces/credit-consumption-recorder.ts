import type { CreditConsumptionEvent } from "../entities/credit-consumption-event.entity.js";
import type { CreditConsumptionEventId } from "../../value-objects/index.js";

export interface CreditConsumptionRecorder {
  recordPendingConsumption(event: CreditConsumptionEvent): CreditConsumptionEvent;
  completeConsumption(eventId: CreditConsumptionEventId): CreditConsumptionEvent | null;
  rejectConsumption(eventId: CreditConsumptionEventId, reason: string): CreditConsumptionEvent | null;
  reverseConsumption(eventId: CreditConsumptionEventId, reason: string): CreditConsumptionEvent | null;
}
