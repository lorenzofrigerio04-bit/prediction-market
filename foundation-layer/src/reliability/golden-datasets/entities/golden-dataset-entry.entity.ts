import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { DatasetScope } from "../../enums/dataset-scope.enum.js";
import { PriorityLevel } from "../../enums/priority-level.enum.js";
import type { ArtifactReference } from "../../value-objects/artifact-reference.vo.js";
import { createArtifactReferenceCollection } from "../../value-objects/artifact-reference.vo.js";
import type { ExpectedInvariant } from "../../value-objects/expected-invariant.vo.js";
import { createExpectedInvariantCollection } from "../../value-objects/expected-invariant.vo.js";
import type { GoldenDatasetEntryId } from "../../value-objects/reliability-ids.vo.js";

export type GoldenDatasetEntry = Readonly<{
  id: GoldenDatasetEntryId;
  version: EntityVersion;
  dataset_scope: DatasetScope;
  input_artifact_refs: readonly ArtifactReference[];
  expected_output_refs: readonly ArtifactReference[];
  expected_invariants: readonly ExpectedInvariant[];
  category_tags: readonly string[];
  priority_level: PriorityLevel;
  active: boolean;
}>;

export const createGoldenDatasetEntry = (input: GoldenDatasetEntry): GoldenDatasetEntry => {
  if (!Object.values(DatasetScope).includes(input.dataset_scope)) {
    throw new ValidationError("INVALID_GOLDEN_DATASET_ENTRY", "dataset_scope is invalid");
  }
  if (!Object.values(PriorityLevel).includes(input.priority_level)) {
    throw new ValidationError("INVALID_GOLDEN_DATASET_ENTRY", "priority_level is invalid");
  }
  return deepFreeze({
    ...input,
    input_artifact_refs: createArtifactReferenceCollection(
      input.input_artifact_refs,
      "GoldenDatasetEntry.input_artifact_refs",
    ),
    expected_output_refs: createArtifactReferenceCollection(
      input.expected_output_refs,
      "GoldenDatasetEntry.expected_output_refs",
    ),
    expected_invariants: createExpectedInvariantCollection(input.expected_invariants),
    category_tags: deepFreeze(input.category_tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)),
  });
};
