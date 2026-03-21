import { ReadinessStatus } from "../../enums/readiness-status.enum.js";
import type { CandidateRef } from "../../value-objects/candidate-ref.vo.js";
import type { DisplayLabel } from "../../value-objects/display-label.vo.js";
export type CandidateListEntry = Readonly<{
    candidate_ref: CandidateRef;
    title: DisplayLabel;
    readiness_status: ReadinessStatus;
    warnings_count: number;
}>;
export declare const createCandidateListEntry: (input: CandidateListEntry) => CandidateListEntry;
//# sourceMappingURL=candidate-list-entry.entity.d.ts.map