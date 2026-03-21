import type { Branded } from "../../common/types/branded.js";
import { createNonEmptyTrimmed } from "./platform-access-shared.vo.js";

export type BlockingReason = Branded<string, "BlockingReason">;

export const createBlockingReason = (value: string): BlockingReason =>
  createNonEmptyTrimmed(value, "INVALID_BLOCKING_REASON", "blocking_reason") as BlockingReason;
