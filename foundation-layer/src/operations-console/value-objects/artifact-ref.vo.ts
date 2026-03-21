import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type ArtifactRef = Branded<string, "ArtifactRef">;

export const createArtifactRef = (value: string): ArtifactRef =>
  createPrefixedId(value, "arf_", "ArtifactRef") as ArtifactRef;
