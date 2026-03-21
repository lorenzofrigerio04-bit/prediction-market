import { LearningCompatibilityStatus } from "../../enums/learning-compatibility-status.enum.js";
import { LearningCompatibilityTarget } from "../../enums/learning-compatibility-target.enum.js";
import type { CorrelationId } from "../../value-objects/correlation-id.vo.js";
import type { LearningCompatibilityResultId } from "../../value-objects/learning-feedback-ids.vo.js";
import { type LearningText } from "../../value-objects/learning-feedback-shared.vo.js";
export type LearningCompatibilityResult = Readonly<{
    id: LearningCompatibilityResultId;
    correlation_id: CorrelationId;
    target: LearningCompatibilityTarget;
    status: LearningCompatibilityStatus;
    mapped_artifact: Readonly<Record<string, unknown>>;
    notes: readonly LearningText[];
}>;
export declare const createLearningCompatibilityResult: (input: LearningCompatibilityResult) => LearningCompatibilityResult;
//# sourceMappingURL=learning-compatibility-result.entity.d.ts.map