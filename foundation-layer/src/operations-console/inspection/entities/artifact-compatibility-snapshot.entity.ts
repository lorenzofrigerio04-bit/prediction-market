import { deepFreeze } from "../../../common/utils/deep-freeze.js";

export type ArtifactCompatibilitySnapshot = Readonly<{
  is_compatible: boolean;
  incompatible_with: readonly string[];
  lossy_fields: readonly string[];
}>;

export const createArtifactCompatibilitySnapshot = (
  input: ArtifactCompatibilitySnapshot,
): ArtifactCompatibilitySnapshot => deepFreeze({ ...input });
