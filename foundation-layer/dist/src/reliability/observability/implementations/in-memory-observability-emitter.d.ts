import { type ObservabilityEvent } from "../entities/observability-event.entity.js";
import type { ObservabilityEmitter } from "../interfaces/observability-emitter.js";
export declare class InMemoryObservabilityEmitter implements ObservabilityEmitter {
    private readonly events;
    emit(event: ObservabilityEvent): ObservabilityEvent;
    listEvents(): readonly ObservabilityEvent[];
    clear(): void;
}
//# sourceMappingURL=in-memory-observability-emitter.d.ts.map