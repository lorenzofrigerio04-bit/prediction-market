import type { Branded } from "../../common/types/branded.js";
import { createNonEmpty } from "./shared.vo.js";

export type DecisionRef = Branded<string, "DecisionRef">;

export const createDecisionRef = (value: string): DecisionRef =>
  createNonEmpty(value, "decision_ref") as DecisionRef;
