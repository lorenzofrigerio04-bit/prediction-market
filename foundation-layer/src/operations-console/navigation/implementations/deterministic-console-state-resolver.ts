import type { ConsoleNavigationState } from "../entities/console-navigation-state.entity.js";
import { createConsoleNavigationState } from "../entities/console-navigation-state.entity.js";
import type { ResolveConsoleStateInput, ConsoleStateResolver } from "../interfaces/console-state-resolver.js";
import { validateConsoleNavigationState } from "../../validators/validate-console-navigation-state.js";

export class DeterministicConsoleStateResolver implements ConsoleStateResolver {
  resolve(input: ResolveConsoleStateInput): ConsoleNavigationState {
    const report = validateConsoleNavigationState(input.state);
    if (!report.isValid) {
      throw new Error(`Invalid ConsoleNavigationState: ${report.issues.map((issue) => issue.code).join(",")}`);
    }
    return createConsoleNavigationState(input.state);
  }
}
