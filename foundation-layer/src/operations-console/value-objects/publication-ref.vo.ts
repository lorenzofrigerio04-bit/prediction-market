import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type PublicationRef = Branded<string, "PublicationRef">;

export const createPublicationRef = (value: string): PublicationRef =>
  createPrefixedId(value, "pub_", "PublicationRef") as PublicationRef;
