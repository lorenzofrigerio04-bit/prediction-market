import { PatternStatus } from "../../enums/pattern-status.enum.js";
import type { RejectionPatternId } from "../../value-objects/rejection-pattern-id.vo.js";
import { type LearningRef } from "../../value-objects/learning-feedback-shared.vo.js";
export type RejectionPattern = Readonly<{
    id: RejectionPatternId;
    status: PatternStatus;
    reason_codes: readonly LearningRef[];
    supporting_refs: readonly LearningRef[];
}>;
export declare const createRejectionPattern: (input: RejectionPattern) => RejectionPattern;
//# sourceMappingURL=rejection-pattern.entity.d.ts.map