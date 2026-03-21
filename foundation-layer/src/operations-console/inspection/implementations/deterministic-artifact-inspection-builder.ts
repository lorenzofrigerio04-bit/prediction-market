import type { ArtifactInspectionView } from "../entities/artifact-inspection-view.entity.js";
import { createArtifactInspectionView } from "../entities/artifact-inspection-view.entity.js";
import type { ArtifactInspectionBuilder, BuildArtifactInspectionInput } from "../interfaces/artifact-inspection-builder.js";
import { validateArtifactInspectionView } from "../../validators/validate-artifact-inspection-view.js";

export class DeterministicArtifactInspectionBuilder implements ArtifactInspectionBuilder {
  buildInspectionView(input: BuildArtifactInspectionInput): ArtifactInspectionView {
    const report = validateArtifactInspectionView(input.view);
    if (!report.isValid) {
      throw new Error(`Invalid ArtifactInspectionView: ${report.issues.map((issue) => issue.code).join(",")}`);
    }
    return createArtifactInspectionView(input.view);
  }
}
