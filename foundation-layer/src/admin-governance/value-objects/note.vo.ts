import type { Branded } from "../../common/types/branded.js";
import { createNonEmpty } from "./shared.vo.js";

export type Note = Branded<string, "Note">;

export const createNote = (value: string): Note =>
  createNonEmpty(value, "note") as Note;
