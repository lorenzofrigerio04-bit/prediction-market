import { createObservabilityEvent } from "../entities/observability-event.entity.js";
export class InMemoryObservabilityEmitter {
    events = [];
    emit(event) {
        const normalized = createObservabilityEvent(event);
        this.events.push(normalized);
        return normalized;
    }
    listEvents() {
        return [...this.events];
    }
    clear() {
        this.events.splice(0, this.events.length);
    }
}
//# sourceMappingURL=in-memory-observability-emitter.js.map