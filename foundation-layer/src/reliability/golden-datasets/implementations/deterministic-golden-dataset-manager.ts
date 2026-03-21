import type { ValidationReport } from "../../../entities/validation-report.entity.js";
import { validateGoldenDatasetEntry } from "../../validators/validate-golden-dataset-entry.js";
import type { DatasetScope } from "../../enums/dataset-scope.enum.js";
import { createGoldenDatasetEntry, type GoldenDatasetEntry } from "../entities/golden-dataset-entry.entity.js";
import type { GoldenDatasetManager } from "../interfaces/golden-dataset-manager.js";

export class DeterministicGoldenDatasetManager implements GoldenDatasetManager {
  private readonly entries = new Map<string, GoldenDatasetEntry>();

  register(entry: GoldenDatasetEntry): GoldenDatasetEntry {
    const normalized = createGoldenDatasetEntry(entry);
    this.entries.set(normalized.id, normalized);
    return normalized;
  }

  validate(entry: GoldenDatasetEntry): ValidationReport {
    return validateGoldenDatasetEntry(entry);
  }

  listActive(): readonly GoldenDatasetEntry[] {
    return [...this.entries.values()].filter((entry) => entry.active);
  }

  buildManifest(scope: DatasetScope): readonly string[] {
    return [...this.entries.values()]
      .filter((entry) => entry.active && entry.dataset_scope === scope)
      .map((entry) => entry.id);
  }
}
