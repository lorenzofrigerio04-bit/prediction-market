import { PatternStatus } from "../../enums/pattern-status.enum.js";
import { OverrideType } from "../../enums/override-type.enum.js";
import type { OverridePatternId } from "../../value-objects/override-pattern-id.vo.js";
import { type LearningRef } from "../../value-objects/learning-feedback-shared.vo.js";
export type OverridePattern = Readonly<{
    id: OverridePatternId;
    status: PatternStatus;
    override_type: OverrideType;
    supporting_refs: readonly LearningRef[];
}>;
export declare const createOverridePattern: (input: OverridePattern) => OverridePattern;
//# sourceMappingURL=override-pattern.entity.d.ts.map