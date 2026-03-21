import { createPrefixedId } from "../common/utils/id.js";
import type { Branded } from "../common/types/branded.js";

export type EventId = Branded<string, "EventId">;

export const createEventId = (value: string): EventId =>
  createPrefixedId(value, "evt_", "EventId") as EventId;
