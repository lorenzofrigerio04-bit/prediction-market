export type ArtifactCompatibilitySnapshot = Readonly<{
    is_compatible: boolean;
    incompatible_with: readonly string[];
    lossy_fields: readonly string[];
}>;
export declare const createArtifactCompatibilitySnapshot: (input: ArtifactCompatibilitySnapshot) => ArtifactCompatibilitySnapshot;
//# sourceMappingURL=artifact-compatibility-snapshot.entity.d.ts.map