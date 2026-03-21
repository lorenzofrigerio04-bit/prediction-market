import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ObservabilityEventType } from "../../enums/observability-event-type.enum.js";
import { SeverityLevel } from "../../enums/severity-level.enum.js";
import { TargetModule } from "../../enums/target-module.enum.js";
import { createDiagnosticTagCollection } from "../../value-objects/diagnostic-tag.vo.js";
import { createTraceReferenceCollection } from "../../value-objects/trace-reference.vo.js";
export const createObservabilityEvent = (input) => {
    if (!Object.values(ObservabilityEventType).includes(input.event_type)) {
        throw new ValidationError("INVALID_OBSERVABILITY_EVENT", "event_type is invalid");
    }
    if (!Object.values(TargetModule).includes(input.module_name)) {
        throw new ValidationError("INVALID_OBSERVABILITY_EVENT", "module_name is invalid");
    }
    if (!Object.values(SeverityLevel).includes(input.severity)) {
        throw new ValidationError("INVALID_OBSERVABILITY_EVENT", "severity is invalid");
    }
    if (input.correlation_id.trim().length === 0) {
        throw new ValidationError("INVALID_OBSERVABILITY_EVENT", "correlation_id must not be empty");
    }
    if (input.payload_summary.summary_type.trim().length === 0) {
        throw new ValidationError("INVALID_OBSERVABILITY_EVENT", "payload_summary.summary_type must not be empty");
    }
    return deepFreeze({
        ...input,
        trace_refs: createTraceReferenceCollection(input.trace_refs),
        diagnostic_tags: createDiagnosticTagCollection(input.diagnostic_tags),
        payload_summary: deepFreeze({
            summary_type: input.payload_summary.summary_type.trim(),
            values: deepFreeze({ ...input.payload_summary.values }),
        }),
    });
};
//# sourceMappingURL=observability-event.entity.js.map