export type ArtifactValidationSnapshot = Readonly<{
    is_valid: boolean;
    issue_count: number;
    blocking_issue_count: number;
}>;
export declare const createArtifactValidationSnapshot: (input: ArtifactValidationSnapshot) => ArtifactValidationSnapshot;
//# sourceMappingURL=artifact-validation-snapshot.entity.d.ts.map