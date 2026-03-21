import { createObservabilityEvent, type ObservabilityEvent } from "../entities/observability-event.entity.js";
import type { ObservabilityEmitter } from "../interfaces/observability-emitter.js";

export class InMemoryObservabilityEmitter implements ObservabilityEmitter {
  private readonly events: ObservabilityEvent[] = [];

  emit(event: ObservabilityEvent): ObservabilityEvent {
    const normalized = createObservabilityEvent(event);
    this.events.push(normalized);
    return normalized;
  }

  listEvents(): readonly ObservabilityEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events.splice(0, this.events.length);
  }
}
