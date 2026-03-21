import { validateAdversarialCase } from "../../validators/validate-adversarial-case.js";
import { createAdversarialCase } from "../entities/adversarial-case.entity.js";
export class DeterministicAdversarialSuiteManager {
    cases = new Map();
    register(caseItem) {
        const normalized = createAdversarialCase(caseItem);
        this.cases.set(normalized.id, normalized);
        return normalized;
    }
    validate(caseItem) {
        return validateAdversarialCase(caseItem);
    }
    evaluateActiveCases(cases) {
        const activeCases = cases.filter((item) => item.active);
        return {
            active_case_count: activeCases.length,
            expected_behavior_count: activeCases.filter((item) => item.expected_rejection_or_behavior.length > 0).length,
        };
    }
}
//# sourceMappingURL=deterministic-adversarial-suite-manager.js.map