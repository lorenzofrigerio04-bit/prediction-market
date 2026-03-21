import type { ValidationReport } from "../../../entities/validation-report.entity.js";
import type { RegressionCase } from "../entities/regression-case.entity.js";
export type RegressionSuiteReadiness = Readonly<{
    ready: boolean;
    blocking_case_ids: readonly string[];
}>;
export interface RegressionSuiteManager {
    register(caseItem: RegressionCase): RegressionCase;
    validate(caseItem: RegressionCase): ValidationReport;
    evaluateReadiness(cases: readonly RegressionCase[]): RegressionSuiteReadiness;
}
//# sourceMappingURL=regression-suite-manager.d.ts.map