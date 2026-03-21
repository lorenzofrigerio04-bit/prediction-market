import type { ValidateFunction } from "ajv";
import { type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import { type Timestamp } from "../../value-objects/timestamp.vo.js";
export type ValidationOptions = Readonly<{
    generatedAt?: Timestamp;
}>;
export declare const buildValidationReport: (targetType: string, targetId: string, issues: readonly ValidationIssue[], generatedAt: Timestamp) => ValidationReport;
export declare const resolveGeneratedAt: (options?: ValidationOptions) => Timestamp;
export declare const requireSchemaValidator: (schemaId: string) => ValidateFunction;
export declare const validateBySchema: (validateFn: ValidateFunction, payload: unknown) => readonly ValidationIssue[];
//# sourceMappingURL=validation-result.d.ts.map