import { deepFreeze } from "../../../common/utils/deep-freeze.js";

export type ArtifactStructuredField = Readonly<{
  key: string;
  value_type: string;
  value_summary: string;
}>;

export const createArtifactStructuredField = (input: ArtifactStructuredField): ArtifactStructuredField =>
  deepFreeze({ ...input });
