import { ArtifactType } from "../../enums/artifact-type.enum.js";
import { type ArtifactReference } from "../../value-objects/artifact-reference.vo.js";
import { type IntegrityHash } from "../../value-objects/integrity-hash.vo.js";
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
export declare const createPublicationArtifact: (input: PublicationArtifactInput) => PublicationArtifact;
//# sourceMappingURL=publication-artifact.entity.d.ts.map