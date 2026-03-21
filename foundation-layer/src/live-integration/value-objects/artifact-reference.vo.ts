import type { Branded } from "../../common/types/branded.js";
import { assertNonEmpty } from "../../common/utils/normalization.js";

export type ArtifactReference = Branded<string, "ArtifactReference">;

export const createArtifactReference = (value: string): ArtifactReference =>
  assertNonEmpty(value, "artifact_reference") as ArtifactReference;
