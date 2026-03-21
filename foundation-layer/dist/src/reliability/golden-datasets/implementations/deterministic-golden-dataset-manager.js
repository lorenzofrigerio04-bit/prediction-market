import { validateGoldenDatasetEntry } from "../../validators/validate-golden-dataset-entry.js";
import { createGoldenDatasetEntry } from "../entities/golden-dataset-entry.entity.js";
export class DeterministicGoldenDatasetManager {
    entries = new Map();
    register(entry) {
        const normalized = createGoldenDatasetEntry(entry);
        this.entries.set(normalized.id, normalized);
        return normalized;
    }
    validate(entry) {
        return validateGoldenDatasetEntry(entry);
    }
    listActive() {
        return [...this.entries.values()].filter((entry) => entry.active);
    }
    buildManifest(scope) {
        return [...this.entries.values()]
            .filter((entry) => entry.active && entry.dataset_scope === scope)
            .map((entry) => entry.id);
    }
}
//# sourceMappingURL=deterministic-golden-dataset-manager.js.map