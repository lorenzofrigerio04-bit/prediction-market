import type { Branded } from "../../common/types/branded.js";
import { createNonEmpty } from "./shared.vo.js";

export type OperationKey = Branded<string, "OperationKey">;

export const createOperationKey = (value: string): OperationKey =>
  createNonEmpty(value, "operation_key") as OperationKey;
