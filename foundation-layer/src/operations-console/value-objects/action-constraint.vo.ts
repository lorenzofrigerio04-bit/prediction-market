import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type ActionConstraintRef = Branded<string, "ActionConstraintRef">;

export const createActionConstraintRef = (value: string): ActionConstraintRef =>
  createPrefixedId(value, "acr_", "ActionConstraintRef") as ActionConstraintRef;
