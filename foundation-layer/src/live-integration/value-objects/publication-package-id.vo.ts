import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type PublicationPackageId = Branded<string, "PublicationPackageId">;

export const createPublicationPackageId = (value: string): PublicationPackageId =>
  createPrefixedId(value, "ppkg_", "PublicationPackageId") as PublicationPackageId;
