import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ArtifactType } from "../../enums/artifact-type.enum.js";
import type { ArtifactRef } from "../../value-objects/artifact-ref.vo.js";
import type { ArtifactInspectionViewId } from "../../value-objects/operations-console-ids.vo.js";
import type { ArtifactCompatibilitySnapshot } from "./artifact-compatibility-snapshot.entity.js";
import type { ArtifactStructuredField } from "./artifact-structured-field.entity.js";
import type { ArtifactValidationSnapshot } from "./artifact-validation-snapshot.entity.js";

export type ArtifactInspectionView = Readonly<{
  id: ArtifactInspectionViewId;
  version: string;
  artifact_ref: ArtifactRef;
  artifact_type: ArtifactType;
  structured_fields: readonly ArtifactStructuredField[];
  validation_snapshot: ArtifactValidationSnapshot;
  compatibility_snapshot: ArtifactCompatibilitySnapshot;
  related_refs: readonly string[];
}>;

export const createArtifactInspectionView = (input: ArtifactInspectionView): ArtifactInspectionView =>
  deepFreeze({ ...input });
