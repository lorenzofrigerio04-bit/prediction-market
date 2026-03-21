import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type PublicationHandoffId = Branded<string, "PublicationHandoffId">;

export const createPublicationHandoffId = (value: string): PublicationHandoffId =>
  createPrefixedId(value, "phnd_", "PublicationHandoffId") as PublicationHandoffId;
