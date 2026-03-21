import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { SeverityLevel } from "../../enums/severity-level.enum.js";
import { TargetModule } from "../../enums/target-module.enum.js";
import type { ArtifactReference } from "../../value-objects/artifact-reference.vo.js";
import type { GoldenDatasetEntryId, RegressionCaseId } from "../../value-objects/reliability-ids.vo.js";
export type RegressionCase = Readonly<{
    id: RegressionCaseId;
    version: EntityVersion;
    case_name: string;
    target_module: TargetModule;
    input_refs: readonly ArtifactReference[];
    expected_behavior: string;
    failure_signature_nullable: string | null;
    severity: SeverityLevel;
    linked_dataset_entry_id_nullable: GoldenDatasetEntryId | null;
}>;
export declare const createRegressionCase: (input: RegressionCase) => RegressionCase;
//# sourceMappingURL=regression-case.entity.d.ts.map