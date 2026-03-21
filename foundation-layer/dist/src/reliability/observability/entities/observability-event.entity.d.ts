import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { ObservabilityEventType } from "../../enums/observability-event-type.enum.js";
import { SeverityLevel } from "../../enums/severity-level.enum.js";
import { TargetModule } from "../../enums/target-module.enum.js";
import type { CorrelationId } from "../../value-objects/correlation-id.vo.js";
import { type DiagnosticTag } from "../../value-objects/diagnostic-tag.vo.js";
import type { ObservabilityEventId } from "../../value-objects/reliability-ids.vo.js";
import type { TraceReference } from "../../value-objects/trace-reference.vo.js";
export type ObservabilityEventPayloadSummary = Readonly<{
    summary_type: string;
    values: Readonly<Record<string, string | number | boolean | null>>;
}>;
export type ObservabilityEvent = Readonly<{
    id: ObservabilityEventId;
    version: EntityVersion;
    event_type: ObservabilityEventType;
    module_name: TargetModule;
    correlation_id: CorrelationId;
    emitted_at: Timestamp;
    severity: SeverityLevel;
    payload_summary: ObservabilityEventPayloadSummary;
    trace_refs: readonly TraceReference[];
    diagnostic_tags: readonly DiagnosticTag[];
}>;
export declare const createObservabilityEvent: (input: ObservabilityEvent) => ObservabilityEvent;
//# sourceMappingURL=observability-event.entity.d.ts.map