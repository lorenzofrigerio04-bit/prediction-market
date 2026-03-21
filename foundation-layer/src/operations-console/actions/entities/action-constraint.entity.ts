import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { ActionConstraintRef } from "../../value-objects/action-constraint.vo.js";

export type ActionConstraint = Readonly<{
  constraint_ref: ActionConstraintRef;
  description: string;
  is_blocking: boolean;
}>;

export const createActionConstraint = (input: ActionConstraint): ActionConstraint => deepFreeze({ ...input });
