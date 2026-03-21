import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type EditorialFeedbackId = Branded<string, "EditorialFeedbackId">;

export const createEditorialFeedbackId = (value: string): EditorialFeedbackId =>
  createPrefixedId(value, "lef_", "EditorialFeedbackId") as EditorialFeedbackId;
