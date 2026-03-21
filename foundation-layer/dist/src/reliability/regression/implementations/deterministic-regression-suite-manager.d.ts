import type { ValidationReport } from "../../../entities/validation-report.entity.js";
import { type RegressionCase } from "../entities/regression-case.entity.js";
import type { RegressionSuiteManager, RegressionSuiteReadiness } from "../interfaces/regression-suite-manager.js";
export declare class DeterministicRegressionSuiteManager implements RegressionSuiteManager {
    private readonly cases;
    register(caseItem: RegressionCase): RegressionCase;
    validate(caseItem: RegressionCase): ValidationReport;
    evaluateReadiness(cases: readonly RegressionCase[]): RegressionSuiteReadiness;
}
//# sourceMappingURL=deterministic-regression-suite-manager.d.ts.map