import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { AdversarialType } from "../../enums/adversarial-type.enum.js";
import { RiskLevel } from "../../enums/risk-level.enum.js";
import { TargetModule } from "../../enums/target-module.enum.js";
import type { AdversarialCaseId } from "../../value-objects/reliability-ids.vo.js";
import type { ArtifactReference } from "../../value-objects/artifact-reference.vo.js";
export type AdversarialCase = Readonly<{
    id: AdversarialCaseId;
    version: EntityVersion;
    target_module: TargetModule;
    adversarial_type: AdversarialType;
    crafted_input_refs: readonly ArtifactReference[];
    expected_rejection_or_behavior: string;
    risk_level: RiskLevel;
    active: boolean;
}>;
export declare const createAdversarialCase: (input: AdversarialCase) => AdversarialCase;
//# sourceMappingURL=adversarial-case.entity.d.ts.map