import type { ArtifactInspectionView } from "../entities/artifact-inspection-view.entity.js";

export type BuildArtifactInspectionInput = Readonly<{
  view: ArtifactInspectionView;
}>;

export interface ArtifactInspectionBuilder {
  buildInspectionView(input: BuildArtifactInspectionInput): ArtifactInspectionView;
}
