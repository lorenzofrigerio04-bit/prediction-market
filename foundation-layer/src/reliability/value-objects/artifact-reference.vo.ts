import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { TargetModule } from "../enums/target-module.enum.js";

export type ArtifactReference = Readonly<{
  module_name: TargetModule;
  artifact_type: string;
  artifact_id: string;
  artifact_version_nullable: number | null;
  uri_nullable: string | null;
}>;

export const createArtifactReference = (input: ArtifactReference): ArtifactReference => {
  if (input.artifact_type.trim().length === 0) {
    throw new ValidationError("INVALID_ARTIFACT_REFERENCE", "artifact_type must not be empty");
  }
  if (input.artifact_id.trim().length === 0) {
    throw new ValidationError("INVALID_ARTIFACT_REFERENCE", "artifact_id must not be empty");
  }
  if (
    input.artifact_version_nullable !== null &&
    (!Number.isInteger(input.artifact_version_nullable) || input.artifact_version_nullable < 1)
  ) {
    throw new ValidationError(
      "INVALID_ARTIFACT_REFERENCE",
      "artifact_version_nullable must be null or an integer >= 1",
    );
  }
  return deepFreeze(input);
};

export const createArtifactReferenceCollection = (
  input: readonly ArtifactReference[],
  fieldName: string,
): readonly ArtifactReference[] => {
  const normalized = input.map((item) => createArtifactReference(item));
  const dedupe = new Set<string>();
  for (const item of normalized) {
    const key = `${item.module_name}|${item.artifact_type}|${item.artifact_id}`;
    if (dedupe.has(key)) {
      throw new ValidationError(
        "DUPLICATE_ARTIFACT_REFERENCE",
        `${fieldName} contains duplicated module_name/artifact_type/artifact_id`,
      );
    }
    dedupe.add(key);
  }
  return deepFreeze([...normalized]);
};
