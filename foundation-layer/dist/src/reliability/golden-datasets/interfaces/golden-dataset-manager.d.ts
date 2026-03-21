import type { ValidationReport } from "../../../entities/validation-report.entity.js";
import type { DatasetScope } from "../../enums/dataset-scope.enum.js";
import type { GoldenDatasetEntry } from "../entities/golden-dataset-entry.entity.js";
export interface GoldenDatasetManager {
    register(entry: GoldenDatasetEntry): GoldenDatasetEntry;
    validate(entry: GoldenDatasetEntry): ValidationReport;
    listActive(): readonly GoldenDatasetEntry[];
    buildManifest(scope: DatasetScope): readonly string[];
}
//# sourceMappingURL=golden-dataset-manager.d.ts.map