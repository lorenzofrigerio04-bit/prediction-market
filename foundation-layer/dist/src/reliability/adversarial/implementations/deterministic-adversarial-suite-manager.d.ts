import type { ValidationReport } from "../../../entities/validation-report.entity.js";
import { type AdversarialCase } from "../entities/adversarial-case.entity.js";
import type { AdversarialSuiteManager, AdversarialSuiteOutcome } from "../interfaces/adversarial-suite-manager.js";
export declare class DeterministicAdversarialSuiteManager implements AdversarialSuiteManager {
    private readonly cases;
    register(caseItem: AdversarialCase): AdversarialCase;
    validate(caseItem: AdversarialCase): ValidationReport;
    evaluateActiveCases(cases: readonly AdversarialCase[]): AdversarialSuiteOutcome;
}
//# sourceMappingURL=deterministic-adversarial-suite-manager.d.ts.map