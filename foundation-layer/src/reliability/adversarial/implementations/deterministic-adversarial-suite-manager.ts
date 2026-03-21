import type { ValidationReport } from "../../../entities/validation-report.entity.js";
import { validateAdversarialCase } from "../../validators/validate-adversarial-case.js";
import { createAdversarialCase, type AdversarialCase } from "../entities/adversarial-case.entity.js";
import type {
  AdversarialSuiteManager,
  AdversarialSuiteOutcome,
} from "../interfaces/adversarial-suite-manager.js";

export class DeterministicAdversarialSuiteManager implements AdversarialSuiteManager {
  private readonly cases = new Map<string, AdversarialCase>();

  register(caseItem: AdversarialCase): AdversarialCase {
    const normalized = createAdversarialCase(caseItem);
    this.cases.set(normalized.id, normalized);
    return normalized;
  }

  validate(caseItem: AdversarialCase): ValidationReport {
    return validateAdversarialCase(caseItem);
  }

  evaluateActiveCases(cases: readonly AdversarialCase[]): AdversarialSuiteOutcome {
    const activeCases = cases.filter((item) => item.active);
    return {
      active_case_count: activeCases.length,
      expected_behavior_count: activeCases.filter((item) => item.expected_rejection_or_behavior.length > 0).length,
    };
  }
}
