/**
 * Result of converting an EventLead to a SourceObservation.
 * Explains outcome (converted / skipped / rejected) and preserves lead/cluster for explainability.
 */
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createEventLeadObservationConversionResult = (input) => deepFreeze({ ...input });
//# sourceMappingURL=event-lead-observation-conversion-result.entity.js.map