import { createArtifactInspectionView } from "../entities/artifact-inspection-view.entity.js";
import { validateArtifactInspectionView } from "../../validators/validate-artifact-inspection-view.js";
export class DeterministicArtifactInspectionBuilder {
    buildInspectionView(input) {
        const report = validateArtifactInspectionView(input.view);
        if (!report.isValid) {
            throw new Error(`Invalid ArtifactInspectionView: ${report.issues.map((issue) => issue.code).join(",")}`);
        }
        return createArtifactInspectionView(input.view);
    }
}
//# sourceMappingURL=deterministic-artifact-inspection-builder.js.map