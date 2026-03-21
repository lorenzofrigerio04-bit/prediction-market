import type { TargetModule } from "../enums/target-module.enum.js";
export type ArtifactReference = Readonly<{
    module_name: TargetModule;
    artifact_type: string;
    artifact_id: string;
    artifact_version_nullable: number | null;
    uri_nullable: string | null;
}>;
export declare const createArtifactReference: (input: ArtifactReference) => ArtifactReference;
export declare const createArtifactReferenceCollection: (input: readonly ArtifactReference[], fieldName: string) => readonly ArtifactReference[];
//# sourceMappingURL=artifact-reference.vo.d.ts.map