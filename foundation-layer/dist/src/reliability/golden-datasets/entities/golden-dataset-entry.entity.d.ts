import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { DatasetScope } from "../../enums/dataset-scope.enum.js";
import { PriorityLevel } from "../../enums/priority-level.enum.js";
import type { ArtifactReference } from "../../value-objects/artifact-reference.vo.js";
import type { ExpectedInvariant } from "../../value-objects/expected-invariant.vo.js";
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
export declare const createGoldenDatasetEntry: (input: GoldenDatasetEntry) => GoldenDatasetEntry;
//# sourceMappingURL=golden-dataset-entry.entity.d.ts.map