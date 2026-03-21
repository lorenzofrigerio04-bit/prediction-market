import type { CanonicalEventIntelligenceId } from "../../../event-intelligence/value-objects/event-intelligence-ids.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { DeadlineBasisType } from "../../enums/deadline-basis-type.enum.js";
import type { DeadlineResolutionId } from "../../value-objects/market-design-ids.vo.js";
export type DeadlineResolution = Readonly<{
    id: DeadlineResolutionId;
    canonical_event_id: CanonicalEventIntelligenceId;
    event_deadline: Timestamp;
    market_close_time: Timestamp;
    resolution_cutoff_nullable: Timestamp | null;
    timezone: string;
    deadline_basis_type: DeadlineBasisType;
    deadline_basis_reference: string;
    confidence: number;
    warnings: readonly string[];
}>;
export declare const createDeadlineResolution: (input: DeadlineResolution) => DeadlineResolution;
//# sourceMappingURL=deadline-resolution.entity.d.ts.map