import { type ValidationReport } from "../../entities/validation-report.entity.js";
import { type ValidationOptions } from "../../validators/common/validation-result.js";
import type { ControlledStateTransition } from "../workflow/entities/controlled-state-transition.entity.js";
import type { ControlledTransitionContext } from "../workflow/interfaces/controlled-state-transition-manager.js";
export type ControlledTransitionValidationOptions = ValidationOptions & {
    context: ControlledTransitionContext;
};
export declare const validateControlledStateTransition: (input: ControlledStateTransition, options: ControlledTransitionValidationOptions) => ValidationReport;
//# sourceMappingURL=validate-controlled-state-transition.d.ts.map