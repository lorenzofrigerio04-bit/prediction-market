import type { ValidationReport } from "../../../entities/validation-report.entity.js";
import { SeverityLevel } from "../../enums/severity-level.enum.js";
import { validateRegressionCase } from "../../validators/validate-regression-case.js";
import { createRegressionCase, type RegressionCase } from "../entities/regression-case.entity.js";
import type {
  RegressionSuiteManager,
  RegressionSuiteReadiness,
} from "../interfaces/regression-suite-manager.js";

export class DeterministicRegressionSuiteManager implements RegressionSuiteManager {
  private readonly cases = new Map<string, RegressionCase>();

  register(caseItem: RegressionCase): RegressionCase {
    const normalized = createRegressionCase(caseItem);
    this.cases.set(normalized.id, normalized);
    return normalized;
  }

  validate(caseItem: RegressionCase): ValidationReport {
    return validateRegressionCase(caseItem);
  }

  evaluateReadiness(cases: readonly RegressionCase[]): RegressionSuiteReadiness {
    const blocking = cases
      .filter((item) => item.severity === SeverityLevel.CRITICAL && item.expected_behavior.trim().length === 0)
      .map((item) => item.id);
    return {
      ready: blocking.length === 0,
      blocking_case_ids: blocking,
    };
  }
}
