import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { ImprovementArtifactType } from "../../enums/improvement-artifact-type.enum.js";
import type { CorrelationId } from "../../value-objects/correlation-id.vo.js";
import type { ImprovementArtifactId } from "../../value-objects/learning-feedback-ids.vo.js";
import { type LearningRef, type LearningText } from "../../value-objects/learning-feedback-shared.vo.js";
export type ImprovementArtifact = Readonly<{
    id: ImprovementArtifactId;
    version: EntityVersion;
    correlation_id: CorrelationId;
    artifact_type: ImprovementArtifactType;
    derived_from_refs: readonly LearningRef[];
    safety_constraints: readonly LearningText[];
    rollout_notes: readonly LearningText[];
    created_at: Timestamp;
}>;
export declare const createImprovementArtifact: (input: ImprovementArtifact) => ImprovementArtifact;
//# sourceMappingURL=improvement-artifact.entity.d.ts.map