import { ValidatorSeverity } from "../../enums/validator-severity.enum.js";
export type NormalizationIssue = Readonly<{
    code: string;
    path: string;
    message: string;
    severity: ValidatorSeverity;
    context?: Record<string, unknown>;
}>;
//# sourceMappingURL=normalization-issue.d.ts.map