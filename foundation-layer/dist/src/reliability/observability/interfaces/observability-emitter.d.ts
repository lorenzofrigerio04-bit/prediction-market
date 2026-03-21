import type { ObservabilityEvent } from "../entities/observability-event.entity.js";
export interface ObservabilityEmitter {
    emit(event: ObservabilityEvent): ObservabilityEvent;
    listEvents(): readonly ObservabilityEvent[];
    clear(): void;
}
//# sourceMappingURL=observability-emitter.d.ts.map