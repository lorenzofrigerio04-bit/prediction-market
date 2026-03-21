import type { ValidationReport } from "../../../entities/validation-report.entity.js";
import type { AdversarialCase } from "../entities/adversarial-case.entity.js";
export type AdversarialSuiteOutcome = Readonly<{
    active_case_count: number;
    expected_behavior_count: number;
}>;
export interface AdversarialSuiteManager {
    register(caseItem: AdversarialCase): AdversarialCase;
    validate(caseItem: AdversarialCase): ValidationReport;
    evaluateActiveCases(cases: readonly AdversarialCase[]): AdversarialSuiteOutcome;
}
//# sourceMappingURL=adversarial-suite-manager.d.ts.map