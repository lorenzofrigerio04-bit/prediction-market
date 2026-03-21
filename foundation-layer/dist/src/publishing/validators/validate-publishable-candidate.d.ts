import { type ValidationReport } from "../../entities/validation-report.entity.js";
import { type ValidationOptions } from "../../validators/common/validation-result.js";
import type { PublishableCandidate } from "../candidate/entities/publishable-candidate.entity.js";
import type { TitleSet } from "../titles/entities/title-set.entity.js";
import type { ResolutionSummary } from "../summaries/entities/resolution-summary.entity.js";
import { type RulebookCompilation } from "../rulebook/entities/rulebook-compilation.entity.js";
export type PublishableCandidateLinkedArtifacts = Readonly<{
    title_set_nullable?: TitleSet | null;
    resolution_summary_nullable?: ResolutionSummary | null;
    rulebook_compilation_nullable?: RulebookCompilation | null;
}>;
export type PublishableCandidateValidationOptions = ValidationOptions & {
    linked_artifacts?: PublishableCandidateLinkedArtifacts;
};
export declare const validatePublishableCandidate: (input: PublishableCandidate, options?: PublishableCandidateValidationOptions) => ValidationReport;
//# sourceMappingURL=validate-publishable-candidate.d.ts.map