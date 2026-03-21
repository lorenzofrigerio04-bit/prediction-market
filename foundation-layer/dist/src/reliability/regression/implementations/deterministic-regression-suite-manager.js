import { SeverityLevel } from "../../enums/severity-level.enum.js";
import { validateRegressionCase } from "../../validators/validate-regression-case.js";
import { createRegressionCase } from "../entities/regression-case.entity.js";
export class DeterministicRegressionSuiteManager {
    cases = new Map();
    register(caseItem) {
        const normalized = createRegressionCase(caseItem);
        this.cases.set(normalized.id, normalized);
        return normalized;
    }
    validate(caseItem) {
        return validateRegressionCase(caseItem);
    }
    evaluateReadiness(cases) {
        const blocking = cases
            .filter((item) => item.severity === SeverityLevel.CRITICAL && item.expected_behavior.trim().length === 0)
            .map((item) => item.id);
        return {
            ready: blocking.length === 0,
            blocking_case_ids: blocking,
        };
    }
}
//# sourceMappingURL=deterministic-regression-suite-manager.js.map