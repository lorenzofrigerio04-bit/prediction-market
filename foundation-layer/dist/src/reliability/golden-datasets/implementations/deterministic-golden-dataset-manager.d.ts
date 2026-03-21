import type { ValidationReport } from "../../../entities/validation-report.entity.js";
import type { DatasetScope } from "../../enums/dataset-scope.enum.js";
import { type GoldenDatasetEntry } from "../entities/golden-dataset-entry.entity.js";
import type { GoldenDatasetManager } from "../interfaces/golden-dataset-manager.js";
export declare class DeterministicGoldenDatasetManager implements GoldenDatasetManager {
    private readonly entries;
    register(entry: GoldenDatasetEntry): GoldenDatasetEntry;
    validate(entry: GoldenDatasetEntry): ValidationReport;
    listActive(): readonly GoldenDatasetEntry[];
    buildManifest(scope: DatasetScope): readonly string[];
}
//# sourceMappingURL=deterministic-golden-dataset-manager.d.ts.map