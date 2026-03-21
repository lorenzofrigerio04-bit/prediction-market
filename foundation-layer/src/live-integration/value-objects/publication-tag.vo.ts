import type { Branded } from "../../common/types/branded.js";
import { assertNonEmpty } from "../../common/utils/normalization.js";

export type PublicationTag = Branded<string, "PublicationTag">;

export const createPublicationTag = (value: string): PublicationTag =>
  assertNonEmpty(value, "publication_tag") as PublicationTag;
