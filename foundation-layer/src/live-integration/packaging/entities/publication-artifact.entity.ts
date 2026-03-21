import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ArtifactType } from "../../enums/artifact-type.enum.js";
import {
  createArtifactReference,
  type ArtifactReference,
} from "../../value-objects/artifact-reference.vo.js";
import { createIntegrityHash, type IntegrityHash } from "../../value-objects/integrity-hash.vo.js";

export type PublicationArtifact = Readonly<{
  artifact_type: ArtifactType;
  artifact_ref: ArtifactReference;
  integrity_hash: IntegrityHash;
  required: boolean;
}>;

export type PublicationArtifactInput = Readonly<{
  artifact_type: ArtifactType;
  artifact_ref: string;
  integrity_hash: string;
  required: boolean;
}>;

export const createPublicationArtifact = (input: PublicationArtifactInput): PublicationArtifact => {
  if (!Object.values(ArtifactType).includes(input.artifact_type)) {
    throw new ValidationError("INVALID_PUBLICATION_ARTIFACT", "artifact_type is invalid");
  }
  if (typeof input.required !== "boolean") {
    throw new ValidationError("INVALID_PUBLICATION_ARTIFACT", "required must be boolean");
  }
  return deepFreeze({
    artifact_type: input.artifact_type,
    artifact_ref: createArtifactReference(input.artifact_ref),
    integrity_hash: createIntegrityHash(input.integrity_hash),
    required: input.required,
  });
};
