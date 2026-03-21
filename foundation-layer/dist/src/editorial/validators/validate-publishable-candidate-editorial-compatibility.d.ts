import { type ValidationReport } from "../../entities/validation-report.entity.js";
import { type ValidationOptions } from "../../validators/common/validation-result.js";
import type { PublishableCandidate } from "../../publishing/candidate/entities/publishable-candidate.entity.js";
import type { ReviewQueueEntry } from "../queue/entities/review-queue-entry.entity.js";
export type PublishableCandidateEditorialCompatibilityInput = Readonly<{
    candidate: PublishableCandidate;
    queue_entry: ReviewQueueEntry;
}>;
export declare const validatePublishableCandidateEditorialCompatibility: (input: PublishableCandidateEditorialCompatibilityInput, options?: ValidationOptions) => ValidationReport;
//# sourceMappingURL=validate-publishable-candidate-editorial-compatibility.d.ts.map