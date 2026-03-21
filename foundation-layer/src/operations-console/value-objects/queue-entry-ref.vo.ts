import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type QueueEntryRef = Branded<string, "QueueEntryRef">;

export const createQueueEntryRef = (value: string): QueueEntryRef =>
  createPrefixedId(value, "qer_", "QueueEntryRef") as QueueEntryRef;
