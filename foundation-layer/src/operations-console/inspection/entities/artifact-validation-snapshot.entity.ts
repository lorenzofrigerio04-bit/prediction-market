import { deepFreeze } from "../../../common/utils/deep-freeze.js";

export type ArtifactValidationSnapshot = Readonly<{
  is_valid: boolean;
  issue_count: number;
  blocking_issue_count: number;
}>;

export const createArtifactValidationSnapshot = (
  input: ArtifactValidationSnapshot,
): ArtifactValidationSnapshot => deepFreeze({ ...input });
