import { type ValidationReport } from "../../entities/validation-report.entity.js";
import { type ValidationOptions } from "../../validators/common/validation-result.js";
import type { OperationsConsoleCompatibilityResult } from "../compatibility/entities/operations-console-compatibility-result.entity.js";
export type CompatibilityValidationContext = Readonly<{
    source_visibility: "visible" | "partial" | "hidden";
    source_allowed_actions: readonly string[];
    source_denied_actions: readonly string[];
}>;
export declare const validateOperationsConsoleCompatibility: (input: OperationsConsoleCompatibilityResult, options?: ValidationOptions, context?: CompatibilityValidationContext) => ValidationReport;
//# sourceMappingURL=validate-operations-console-compatibility.d.ts.map