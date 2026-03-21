import { ValidatorSeverity } from "../enums/validator-severity.enum.js";
import type { Timestamp } from "../value-objects/timestamp.vo.js";
export type ValidationIssue = Readonly<{
    code: string;
    path: string;
    message: string;
    severity: ValidatorSeverity;
    context?: Record<string, unknown>;
}>;
export type ValidationReport = Readonly<{
    targetType: string;
    targetId: string;
    isValid: boolean;
    issues: readonly ValidationIssue[];
    generatedAt: Timestamp;
}>;
export declare const sortValidationIssues: (issues: readonly ValidationIssue[]) => readonly ValidationIssue[];
export declare const createValidationReport: (input: ValidationReport) => ValidationReport;
export declare const errorIssue: (code: string, path: string, message: string, context?: Record<string, unknown>) => ValidationIssue;
//# sourceMappingURL=validation-report.entity.d.ts.map