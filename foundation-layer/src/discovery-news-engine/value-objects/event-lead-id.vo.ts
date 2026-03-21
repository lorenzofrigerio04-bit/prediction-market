import { createPrefixedId } from "../../common/utils/id.js";
import type { Branded } from "../../common/types/branded.js";

export type EventLeadId = Branded<string, "EventLeadId">;

export const createEventLeadId = (value: string): EventLeadId =>
  createPrefixedId(value, "del_", "EventLeadId") as EventLeadId;
