import type { NormalizationIssue } from "../../observations/interfaces/normalization-issue.js";
export type PayloadValidationResult = Readonly<{
    isValid: boolean;
    issues: readonly NormalizationIssue[];
}>;
//# sourceMappingURL=payload-validation-result.d.ts.map