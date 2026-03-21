import { ArtifactType } from "../../enums/artifact-type.enum.js";
import type { ArtifactRef } from "../../value-objects/artifact-ref.vo.js";
export type CandidateArtifactSection = Readonly<{
    artifact_ref: ArtifactRef;
    artifact_type: ArtifactType;
    section_title: string;
    field_count: number;
}>;
export declare const createCandidateArtifactSection: (input: CandidateArtifactSection) => CandidateArtifactSection;
//# sourceMappingURL=candidate-artifact-section.entity.d.ts.map