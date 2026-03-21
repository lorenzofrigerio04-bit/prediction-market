import type { ActionConstraintRef } from "../../value-objects/action-constraint.vo.js";
export type ActionConstraint = Readonly<{
    constraint_ref: ActionConstraintRef;
    description: string;
    is_blocking: boolean;
}>;
export declare const createActionConstraint: (input: ActionConstraint) => ActionConstraint;
//# sourceMappingURL=action-constraint.entity.d.ts.map