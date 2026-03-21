import { ReadinessStatus } from "../../enums/readiness-status.enum.js";
import type { BlockingIssue } from "../../value-objects/blocking-issue.vo.js";
import type { WarningMessage } from "../../value-objects/warning-message.vo.js";
export type CandidateReadinessSnapshot = Readonly<{
    readiness_status: ReadinessStatus;
    blocking_issues: readonly BlockingIssue[];
    warnings: readonly WarningMessage[];
}>;
export declare const createCandidateReadinessSnapshot: (input: CandidateReadinessSnapshot) => CandidateReadinessSnapshot;
//# sourceMappingURL=candidate-readiness-snapshot.entity.d.ts.map