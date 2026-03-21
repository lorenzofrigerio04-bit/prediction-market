import { type CreditConsumptionEventId } from "../../value-objects/index.js";
import type { CreditConsumptionEvent } from "../entities/credit-consumption-event.entity.js";
import type { CreditConsumptionRecorder } from "../interfaces/credit-consumption-recorder.js";
export declare class DeterministicCreditConsumptionRecorder implements CreditConsumptionRecorder {
    private readonly byId;
    recordPendingConsumption(event: CreditConsumptionEvent): CreditConsumptionEvent;
    completeConsumption(eventId: CreditConsumptionEventId): CreditConsumptionEvent | null;
    rejectConsumption(eventId: CreditConsumptionEventId, reason: string): CreditConsumptionEvent | null;
    reverseConsumption(eventId: CreditConsumptionEventId, reason: string): CreditConsumptionEvent | null;
}
//# sourceMappingURL=deterministic-credit-consumption-recorder.d.ts.map