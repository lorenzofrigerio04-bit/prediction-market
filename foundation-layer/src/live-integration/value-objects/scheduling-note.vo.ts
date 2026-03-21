import type { Branded } from "../../common/types/branded.js";
import { assertNonEmpty } from "../../common/utils/normalization.js";

export type SchedulingNote = Branded<string, "SchedulingNote">;

export const createSchedulingNote = (value: string): SchedulingNote =>
  assertNonEmpty(value, "scheduling_note") as SchedulingNote;
