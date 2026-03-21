import type { Branded } from "../../common/types/branded.js";
import { createFiniteNumber } from "./shared.vo.js";

export type Amount = Branded<number, "Amount">;

export const createAmount = (
  value: number,
  options?: Readonly<{ allowZero?: boolean; allowNegative?: boolean }>,
): Amount => createFiniteNumber(value, "amount", options) as Amount;
