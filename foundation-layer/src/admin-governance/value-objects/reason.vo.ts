import type { Branded } from "../../common/types/branded.js";
import { createNonEmpty } from "./shared.vo.js";
export type Reason = Branded<string, "Reason">;
export const createReason = (value: string): Reason => createNonEmpty(value, "reason") as Reason;
