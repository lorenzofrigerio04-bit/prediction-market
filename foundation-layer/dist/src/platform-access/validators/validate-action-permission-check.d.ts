import { type ValidationReport } from "../../entities/validation-report.entity.js";
import { type ValidationOptions } from "../../validators/common/validation-result.js";
import type { ActionPermissionCheck } from "../authorization/entities/action-permission-check.entity.js";
import type { AuthorizationDecision } from "../authorization/entities/authorization-decision.entity.js";
export type ActionPermissionValidationContext = Readonly<{
    decision?: AuthorizationDecision;
}>;
export declare const validateActionPermissionCheck: (input: ActionPermissionCheck, options?: ValidationOptions, context?: ActionPermissionValidationContext) => ValidationReport;
//# sourceMappingURL=validate-action-permission-check.d.ts.map